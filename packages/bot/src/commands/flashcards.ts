/* eslint-disable no-console */
import { InlineKeyboard } from "grammy";
import * as path from "node:path";
import {
  CourseService,
  LearningService,
  UserService,
  parseLesson,
  type CourseModule,
} from "@open-learning/core";
import { bot, type BotContext } from "../bot.js";
import { markdownToTelegramHtml } from "../utils/markdown.js";

interface CourseFromDb {
  id: string;
  title: string;
  level: string;
}

interface ContextWithReply {
  from?: { id: number };
  reply: (text: string, options?: object) => Promise<unknown>;
}

interface ContextWithEdit {
  editMessageText: (text: string, options?: object) => Promise<unknown>;
  answerCallbackQuery: (text?: string) => Promise<unknown>;
}

async function showCoursesKeyboard(ctx: ContextWithReply, courses: CourseFromDb[]) {
  const kb = new InlineKeyboard();
  courses.forEach((c) => {
    kb.text(c.title, `fc_course_${c.id}`).row();
  });
  kb.text("⬅️ Volver", "menu_main");

  await ctx.reply(
    markdownToTelegramHtml("🃏 **Flashcards**\n\nElige un curso para generar flashcards:"),
    {
      parse_mode: "HTML",
      reply_markup: kb,
    }
  );
}

async function showLessonsKeyboard(
  ctx: ContextWithEdit,
  course: { title: string },
  lessons: { path: string; title: string; moduleTitle: string }[]
) {
  const kb = new InlineKeyboard();

  lessons.forEach((lesson, index) => {
    kb.text(`${lesson.moduleTitle} — ${lesson.title}`, `fc_lesson_${index}`).row();
  });

  kb.text("⬅️ Volver a cursos", "fc_back_to_courses");

  await ctx.editMessageText(
    markdownToTelegramHtml(`🃏 **${course.title}**\n\nElige la lección que quieres repasar:`),
    { parse_mode: "HTML", reply_markup: kb }
  );
}

export async function showFlashcardsFlow(ctx: ContextWithReply) {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const user = await UserService.getUser(telegramId);
  if (!user) {
    return ctx.reply("👋 ¡Hola! Primero usa /start para registrarte.");
  }

  const courses = await CourseService.listPublicCourses();

  if (courses.length === 0) {
    return ctx.reply("No hay cursos disponibles. ¡Pronto habrá contenido nuevo!");
  }

  await showCoursesKeyboard(ctx, courses);
}

bot.command("flashcards", async (ctx: BotContext) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const user = await UserService.getUser(telegramId);
  if (!user) {
    return ctx.reply("👋 ¡Hola! Primero usa /start para registrarte.");
  }

  const courses = await CourseService.listPublicCourses();

  if (courses.length === 0) {
    return ctx.reply("No hay cursos disponibles. ¡Pronto habrá contenido nuevo!");
  }

  await showCoursesKeyboard(ctx, courses);
});

bot.callbackQuery("menu_flashcards", async (ctx: BotContext) => {
  await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const user = await UserService.getUser(telegramId);
  if (!user) {
    return ctx.reply("👋 ¡Hola! Primero usa /start para registrarte.");
  }

  const courses = await CourseService.listPublicCourses();

  if (courses.length === 0) {
    return ctx.reply("No hay cursos disponibles.");
  }

  await showCoursesKeyboard(ctx, courses);
});

bot.callbackQuery(/^fc_course_(.+)$/, async (ctx: BotContext) => {
  if (!ctx.match) return;
  const courseId = ctx.match[1];
  await ctx.answerCallbackQuery();

  const course = await CourseService.getCourse(courseId);
  if (!course?.metadata) {
    return ctx.reply("Curso no encontrado.");
  }

  const lessons = course.metadata.modules.flatMap((m: CourseModule) =>
    m.lessons
      .filter((l) => l.path)
      .map((l) => ({
        path: l.path!,
        title: l.title,
        moduleTitle: m.title,
      }))
  );

  if (lessons.length === 0) {
    return ctx.reply("Este curso no tiene lecciones disponibles para generar flashcards.");
  }

  ctx.session.flashcardsLessons = lessons;
  ctx.session.flashcardsCourseId = courseId;

  await showLessonsKeyboard(ctx, course, lessons);
});

bot.callbackQuery("fc_back_to_courses", async (ctx: BotContext) => {
  await ctx.answerCallbackQuery();

  const courses = await CourseService.listPublicCourses();
  if (courses.length === 0) {
    return ctx.reply("No hay cursos disponibles.");
  }

  await showCoursesKeyboard(ctx, courses);
});

bot.callbackQuery(/^fc_lesson_(\d+)$/, async (ctx: BotContext) => {
  if (!ctx.match) return;

  const index = parseInt(ctx.match[1], 10);
  const lesson = ctx.session.flashcardsLessons?.[index];
  const courseId = ctx.session.flashcardsCourseId;

  if (!lesson || !courseId) {
    return ctx.reply("Sesión expirada. Por favor, empieza de nuevo con /flashcards.");
  }

  await ctx.answerCallbackQuery("Generando flashcards...");

  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const user = await UserService.getUser(telegramId);
  if (!user) {
    return ctx.reply("Usuario no encontrado. Escribe /start para registrarte.");
  }

  const course = await CourseService.getCourse(courseId);
  if (!course?.metadata) {
    return ctx.reply("Curso no encontrado.");
  }

  const lessonTitle = `${lesson.moduleTitle} — ${lesson.title}`;

  const fullLessonPath = path.join(course.coursePath, lesson.path);
  let parsedLesson;
  try {
    parsedLesson = await parseLesson(fullLessonPath);
  } catch (err) {
    console.error("Error parsing lesson:", err);
    return ctx.reply("No se pudo leer el contenido de esta lección.");
  }

  await ctx.editMessageText("⏳ Generando flashcards con IA...");

  try {
    const flashcards = await LearningService.generateFlashcards(parsedLesson.content, user);

    if (flashcards.length === 0) {
      return ctx.editMessageText(
        "No se pudieron generar flashcards para esta lección. Intenta con otra."
      );
    }

    ctx.session.flashcards = flashcards;
    delete ctx.session.flashcardsLessons;
    delete ctx.session.flashcardsCourseId;

    await ctx.editMessageText(
      markdownToTelegramHtml(`🃏 **${flashcards.length} Flashcards — ${lessonTitle}**`),
      { parse_mode: "HTML" }
    );

    for (const [i, card] of flashcards.entries()) {
      const kb = new InlineKeyboard().text("👁️ Ver respuesta", `fc_reveal_${i}`);
      await ctx.reply(markdownToTelegramHtml(`${i + 1}. ${card.front}`), {
        parse_mode: "HTML",
        reply_markup: kb,
      });
    }

    await ctx.reply("¡Eso es todo! Usa 📚 Cursos para seguir aprendiendo.", {
      reply_markup: { inline_keyboard: [[{ text: "⬅️ Inicio", callback_data: "menu_main" }]] },
    });
  } catch (err) {
    console.error("Flashcard generation error:", err);
    await ctx.editMessageText(
      "Hubo un problema generando las flashcards. Inténtalo de nuevo más tarde."
    );
  }
});

bot.callbackQuery(/^fc_reveal_(\d+)$/, async (ctx: BotContext) => {
  if (!ctx.match) return;
  const index = parseInt(ctx.match[1], 10);
  const card = ctx.session.flashcards?.[index];

  if (!card) {
    return ctx.answerCallbackQuery("No se encontró la información de esta tarjeta.");
  }

  await ctx.answerCallbackQuery({
    text: card.back.slice(0, 200),
    show_alert: true,
  });
});
