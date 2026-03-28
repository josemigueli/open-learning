import { CourseService } from "@open-learning/core";
import { bot } from "../bot.js";
import { showCourses } from "../controllers/courses.controller.js";
import { markdownToTelegramHtml } from "../utils/markdown.js";

bot.command("cursos", showCourses);

bot.callbackQuery("menu_courses", async (ctx) => {
  try {
    await ctx.answerCallbackQuery();
  } catch {
    // Callback might have been answered in conversation before halting
  }
  await showCourses(ctx);
});

// Handle generic course selection
bot.callbackQuery(/^course_(.+)$/, async (ctx) => {
  if (!ctx.match) return;
  const courseId = ctx.match[1];
  await ctx.answerCallbackQuery();

  const course = await CourseService.getCourse(courseId);
  if (!course) {
    return ctx.reply("El curso no fue encontrado.");
  }

  const text = markdownToTelegramHtml(`📖 **${course.title}**
Nivel: ${course.level}
Idioma: ${course.language}

${course.description}

¿Deseas empezar a estudiar?`);

  await ctx.editMessageText(text, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "▶️ Comenzar / Continuar", callback_data: `study_${course.id}` }],
        [{ text: "⬅️ Volver a cursos", callback_data: "menu_courses" }],
      ],
    },
  });
});
