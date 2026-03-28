import { InlineKeyboard } from "grammy";
import * as path from "node:path";
import {
  CertificateService,
  CourseService,
  LearningService,
  ProgressService,
  UserService,
  parseLesson,
} from "@open-learning/core";
import type { CourseModule } from "@open-learning/core";
import { type BotConversation, type BaseContext, type BotContext } from "../bot.js";
import { showCourses } from "../controllers/courses.controller.js";
import { markdownToTelegramHtml } from "../utils/markdown.js";

type ModuleLesson = CourseModule["lessons"][0];
type Module = CourseModule;

function findLastCompletedLesson(
  modules: Module[],
  completedProgress: { lessonId: string; moduleId: string }[]
): { module: Module; lesson: ModuleLesson } | null {
  const completedLessonIds = completedProgress.map((p) => p.lessonId);

  for (const module of modules) {
    for (const lesson of module.lessons) {
      if (completedLessonIds.includes(lesson.id)) {
        return { module, lesson };
      }
    }
  }
  return null;
}

function findNextUncompletedLesson(
  modules: Module[],
  completedProgress: { lessonId: string }[]
): { module: Module; lesson: ModuleLesson } | null {
  const completedLessonIds = completedProgress.map((p) => p.lessonId);

  for (const module of modules) {
    for (const lesson of module.lessons) {
      if (!completedLessonIds.includes(lesson.id)) {
        return { module, lesson };
      }
    }
  }
  return null;
}

function getTotalLessons(modules: Module[]): number {
  return modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
}

export async function studyConversation(conversation: BotConversation, ctx: BaseContext) {
  const courseId = await conversation.external((outsideCtx) => outsideCtx.session.courseId);
  if (!courseId) return;

  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const user = await conversation.external(() => UserService.getUser(telegramId));
  if (!user) return;

  const course = await conversation.external(() => CourseService.getCourse(courseId));
  if (!course || !course.metadata) return;

  const completedProgress = await conversation.external(() =>
    ProgressService.getCourseProgress(user.id, course.id)
  );

  const totalLessons = getTotalLessons(course.metadata.modules);
  const completedLessons = completedProgress.filter((p) => p.status === "completed");
  const completedCount = completedLessons.length;
  const nextLesson = findNextUncompletedLesson(course.metadata.modules, completedProgress);
  const lastCompleted = findLastCompletedLesson(course.metadata.modules, completedProgress);

  if (completedCount === 0) {
    const firstModule = course.metadata.modules[0];
    const firstLesson = firstModule.lessons[0];
    await studyLesson(conversation, ctx, course, user, firstModule, firstLesson);
    return;
  }

  if (nextLesson === null) {
    await ctx.reply(
      markdownToTelegramHtml(
        `🏆 **¡Felicidades!**\n\nCompletaste las ${totalLessons} lecciones del curso.\n\n¿Querés Reiniciar el curso desde el principio?`
      ),
      { parse_mode: "HTML" }
    );
    const choiceKb = new InlineKeyboard();
    choiceKb.text("🔄 Reiniciar curso", "study_restart").row();
    choiceKb.text("📚 Ver otros cursos", "menu_courses").row();
    choiceKb.text("⬅️ Volver al menú", "menu_main");

    await ctx.reply("Elegí una opción:", { reply_markup: choiceKb });

    const choiceCtx = await conversation.waitForCallbackQuery(
      /^(study_restart|menu_courses|menu_main)$/
    );
    await choiceCtx.answerCallbackQuery();

    if (choiceCtx.match && choiceCtx.match[1] === "menu_courses") {
      await showCourses(ctx as BotContext);
      return;
    }

    if (choiceCtx.match && choiceCtx.match[1] === "menu_main") {
      const mainKeyboard = (await import("../keyboards/main.keyboard.js")).mainKeyboard;
      await choiceCtx.editMessageText("¿Qué te gustaría hacer ahora?", {
        reply_markup: mainKeyboard,
      });
      return;
    }

    const firstModule = course.metadata.modules[0];
    const firstLesson = firstModule.lessons[0];
    await studyLesson(conversation, ctx, course, user, firstModule, firstLesson);
    return;
  }

  await ctx.reply(
    markdownToTelegramHtml(
      `📊 **Tu progreso**\n\nLecciones completadas: ${completedCount}/${totalLessons}\n\n¿Querés reforzar la última lección o avanzar a la siguiente?`
    ),
    { parse_mode: "HTML" }
  );

  const choiceKb = new InlineKeyboard();
  if (lastCompleted) {
    choiceKb
      .text(`🔁 Repetir: ${lastCompleted.lesson.title}`, `study_repeat_${lastCompleted.lesson.id}`)
      .row();
  }
  choiceKb
    .text(`▶️ Siguiente: ${nextLesson.lesson.title}`, `study_next_${nextLesson.lesson.id}`)
    .row();
  choiceKb.text("📚 Ver otros cursos", "menu_courses").row();
  choiceKb.text("⬅️ Volver al menú", "menu_main");

  await ctx.reply("Elegí una opción:", { reply_markup: choiceKb });

  const choiceCtx = await conversation.waitForCallbackQuery(
    /^(study_(repeat|next)_(.+)|menu_courses|menu_main)$/
  );
  await choiceCtx.answerCallbackQuery();

  if (!choiceCtx.match) return;

  const fullMatch = choiceCtx.match[1];

  if (fullMatch === "menu_courses") {
    await showCourses(ctx as BotContext);
    return;
  }

  if (fullMatch === "menu_main") {
    const mainKeyboard = (await import("../keyboards/main.keyboard.js")).mainKeyboard;
    await choiceCtx.editMessageText("¿Qué te gustaría hacer ahora?", {
      reply_markup: mainKeyboard,
    });
    return;
  }

  const action = choiceCtx.match[2];

  let targetModule: Module;
  let targetLesson: ModuleLesson;

  if (action === "repeat") {
    if (!lastCompleted) return;
    targetModule = lastCompleted.module;
    targetLesson = lastCompleted.lesson;
  } else {
    if (!nextLesson) return;
    targetModule = nextLesson.module;
    targetLesson = nextLesson.lesson;
  }

  await studyLesson(conversation, ctx, course, user, targetModule, targetLesson);
}

async function studyLesson(
  conversation: BotConversation,
  ctx: BaseContext,
  course: Awaited<ReturnType<typeof CourseService.getCourse>>,
  user: NonNullable<Awaited<ReturnType<typeof UserService.getUser>>>,
  targetModule: Module,
  targetLesson: ModuleLesson
) {
  if (!targetLesson.path) {
    await ctx.reply("Error: La lección no tiene ruta de archivo.");
    return;
  }

  const lessonPath = path.join(course!.coursePath, targetLesson.path);
  const parsedLesson = await conversation.external(() => parseLesson(lessonPath));

  await ctx.reply(markdownToTelegramHtml(`📖 Iniciando: **${parsedLesson.frontmatter.title}**`), {
    parse_mode: "HTML",
  });

  await ctx.reply(markdownToTelegramHtml(parsedLesson.content), { parse_mode: "HTML" });

  await ctx.reply("⏳ Generando preguntas con IA...");

  const questions = await conversation.external(() =>
    LearningService.generateQuestions(parsedLesson.content, user)
  );

  const session = await conversation.external(() =>
    ProgressService.startSession(user.id, course!.id, targetLesson.id)
  );

  let correctCount = 0;

  const separator = "━━━━━━━━━━━━";

  for (const [index, q] of questions.entries()) {
    const optionsText = q.options
      .map((opt: string, i: number) => `${separator}\n\n${String.fromCharCode(65 + i)}) ${opt}`)
      .join("\n\n");

    const kb = new InlineKeyboard();
    q.options.forEach((_: string, i: number) => {
      kb.text(String.fromCharCode(65 + i), `ans_${i}`);
      if (i < q.options.length - 1) kb.row();
    });

    await ctx.reply(
      markdownToTelegramHtml(
        `❓ Pregunta ${index + 1}/${questions.length}\n\n${separator}\n\n**${q.question}**\n\n${separator}\n\n📝 Opciones:\n\n${optionsText}`
      ),
      {
        parse_mode: "HTML",
        reply_markup: kb,
      }
    );

    const responseCtx = await conversation.waitForCallbackQuery(/^ans_(\d+)$/);
    await responseCtx.answerCallbackQuery();

    if (!responseCtx.match) return;
    const userChoiceIndex = parseInt(responseCtx.match[1], 10);
    const isCorrect = userChoiceIndex === q.correctIndex;

    const userChoiceText = q.options[userChoiceIndex];
    const correctText = q.options[q.correctIndex];

    await ctx.reply("⏳ Evaluando...");

    const evaluation = await conversation.external(() =>
      LearningService.evaluateAnswer(q.question, correctText, userChoiceText, user)
    );

    await conversation.external(() => ProgressService.updateSessionStats(session.id, isCorrect));

    const feedbackIcon = isCorrect ? "✅ Correcto!" : "❌ Incorrecto.";
    await ctx.reply(`${feedbackIcon}\n\n${evaluation.constructiveFeedback}`);

    if (isCorrect) correctCount++;
  }

  await conversation.external(() => ProgressService.finishSession(session.id));
  await conversation.external(() =>
    ProgressService.updateProgress(
      user.id,
      course!.id,
      targetModule.id,
      targetLesson.id,
      (correctCount / questions.length) * 100
    )
  );

  const updatedProgress = await conversation.external(() =>
    ProgressService.getCourseProgress(user.id, course!.id)
  );

  const nextLesson = findNextUncompletedLesson(course!.metadata.modules, updatedProgress);

  await ctx.reply("⏳ Generando resumen de tu sesión...");

  const summary = await conversation.external(() =>
    LearningService.generateSessionSummary(
      { questionsAsked: questions.length, correctAnswers: correctCount },
      course!.language
    )
  );

  await ctx.reply(markdownToTelegramHtml(`📊 **Resumen de Sesión**\n\n${summary}`), {
    parse_mode: "HTML",
  });

  let certUrl: string | null = null;

  if (!nextLesson) {
    const cert = await conversation.external(() =>
      CertificateService.issueCertificate(user.id, course!.id)
    );

    const appUrl = process.env.WEB_URL || "http://localhost:5173";
    const certificateParams = new URLSearchParams({
      name: user.name,
      course: course!.title,
      issuedAt: cert.issuedAt?.toISOString() ?? new Date().toISOString(),
    });
    certUrl = `${appUrl}/cert/${cert.id}?${certificateParams.toString()}`;

    await ctx.reply(
      markdownToTelegramHtml(
        `🏆 **¡Felicidades!**\n\nHas completado todas las lecciones del curso **${course!.title}**.\n\nAquí tienes tu certificado oficial para compartir:\n\n🔗 ${certUrl}`
      ),
      { parse_mode: "HTML" }
    );
  }

  const finalKb = new InlineKeyboard();
  finalKb.text("⬅️ Volver al inicio", "menu_main");
  if (certUrl) {
    finalKb.row().url("🎓 Ver certificado", certUrl);
  }
  if (nextLesson) {
    finalKb.text("▶️ Continuar", `study_${course!.id}`).row();
  }

  await ctx.reply("¿Qué te gustaría hacer ahora?", { reply_markup: finalKb });

  const finalCtx = await conversation.waitForCallbackQuery(/^(menu_main|study_(.+))$/);
  await finalCtx.answerCallbackQuery();

  if (!finalCtx.match) return;

  const finalChoice = finalCtx.match[1];

  if (finalChoice === "menu_main") {
    const mainKeyboard = (await import("../keyboards/main.keyboard.js")).mainKeyboard;
    await finalCtx.editMessageText("¿Qué te gustaría hacer ahora?", { reply_markup: mainKeyboard });
    return;
  }

  // Continuar con la siguiente lección
  if (nextLesson) {
    await studyLesson(conversation, ctx, course, user, nextLesson.module, nextLesson.lesson);
  }
}
