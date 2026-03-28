import { InlineKeyboard } from "grammy";
import {
  UserService,
  CourseService,
  ProgressService,
  type CourseModule,
} from "@open-learning/core";
import type { BotContext } from "../bot.js";
import { bot } from "../bot.js";
import { markdownToTelegramHtml } from "../utils/markdown.js";
import { showConfigMenu } from "./config.js";
import { showFlashcardsFlow } from "./flashcards.js";

interface ContextWithReply {
  from?: { id: number };
  reply: (text: string, options?: object) => Promise<unknown>;
}

interface ContextWithEdit extends ContextWithReply {
  editMessageText: (text: string, options?: object) => Promise<unknown>;
}

const HELP_TEXT = `❓ **Guía de Uso**

Aquí tienes los comandos disponibles:

📚 **/cursos** — Ver todos los cursos disponibles

📊 **/progreso** — Ver tu progreso en cada curso

⚙️ **/config** — Configurar tu nivel preferido

🃏 **/flashcards** — Generar tarjetas de repaso para practicar

──────────────────

**¿Cómo empezar?**

1️⃣ Usa **/cursos** para ver qué cursos hay disponibles
2️⃣ Selecciona uno que te interese
3️⃣ Pulsa "Comenzar / Continuar" para iniciar tu sesión de estudio
4️⃣ Responde las preguntas de la lección y recibe feedback instantáneo

**Consejos:**
• Configura tu nivel con /config para preguntas más fáciles o difíciles
• Usa /progreso para ver cuánto has avanzado
• Repasa con flashcards antes de un examen

¡Mucha suerte con tu aprendizaje! 🚀`;

async function showHelp(ctx: ContextWithEdit) {
  await ctx.reply(markdownToTelegramHtml(HELP_TEXT), { parse_mode: "HTML" });
}

async function showConfig(ctx: ContextWithReply) {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const user = await UserService.getUser(telegramId);
  if (!user) {
    return ctx.reply("👋 ¡Hola! Primero usa /start para registrarte.");
  }

  await showConfigMenu(ctx);
}

bot.callbackQuery("menu_help", async (ctx) => {
  await ctx.answerCallbackQuery();
  await showHelp(ctx);
});

bot.callbackQuery("menu_config", async (ctx) => {
  await ctx.answerCallbackQuery();
  await showConfig(ctx);
});

bot.callbackQuery("menu_continue", async (ctx: BotContext) => {
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

  const coursesWithProgress: {
    course: { id: string; title: string };
    completedCount: number;
    totalLessons: number;
  }[] = [];

  for (const course of courses) {
    const courseProgress = await ProgressService.getCourseProgress(user.id, course.id);
    const completedCount = courseProgress.filter((p) => p.status === "completed").length;
    if (completedCount > 0) {
      const courseFull = await CourseService.getCourse(course.id);
      const totalLessons =
        courseFull?.metadata?.modules.reduce(
          (acc: number, m: CourseModule) => acc + m.lessons.length,
          0
        ) ?? 0;

      // Solo agregamos cursos que no estén completados al 100%
      if (completedCount < totalLessons) {
        coursesWithProgress.push({ course, completedCount, totalLessons });
      }
    }
  }

  if (coursesWithProgress.length === 0) {
    return ctx.reply(
      "📚 Aún no has started ningún curso.\n\nUsa /cursos para ver los cursos disponibles y empezar a estudiar."
    );
  }

  if (coursesWithProgress.length === 1) {
    const { course, completedCount, totalLessons } = coursesWithProgress[0];
    ctx.session.courseId = course.id;
    await ctx.reply(
      `▶️ Continuando con **${course.title}**...\n\nLecciones completadas: ${completedCount}/${totalLessons}`
    );
    await ctx.conversation.enter("studyConversation");
    return;
  }

  const kb = new InlineKeyboard();
  for (const { course, completedCount, totalLessons } of coursesWithProgress) {
    kb.text(`${course.title} (${completedCount}/${totalLessons})`, `study_${course.id}`).row();
  }
  kb.text("⬅️ Volver", "menu_main");

  await ctx.reply("Tenés progreso en varios cursos. ¿Cuál querés continuar?", { reply_markup: kb });
});

bot.callbackQuery("menu_flashcards", async (ctx) => {
  await ctx.answerCallbackQuery();
  await showFlashcardsFlow(ctx);
});
