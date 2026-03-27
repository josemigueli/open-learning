import { UserService, CourseService } from "@open-learning/core";
import { bot } from "../bot.js";
import { mainKeyboard } from "../keyboards/main.keyboard.js";
import { markdownToTelegramHtml } from "../utils/markdown.js";

bot.command("start", async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  const name = ctx.from?.first_name || "Estudiante";

  if (!telegramId) return;

  // Ensure user exists in DB
  await UserService.getOrCreateUser(telegramId, name);

  const payload = ctx.match;
  if (payload) {
    const course = await CourseService.getCourse(payload);
    if (course) {
      const text = markdownToTelegramHtml(
        `👋 ¡Bienvenido a OpenLearning, ${name}!\n\nTe han invitado al curso:\n\n📖 **${course.title}**\nNivel: ${course.level}\nIdioma: ${course.language}\n\n${course.description}\n\n¿Deseas empezar a estudiar?`
      );

      await ctx.reply(text, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "▶️ Comenzar / Continuar", callback_data: `study_${course.id}` }],
            [{ text: "⬅️ Menú Principal", callback_data: "menu_main" }],
          ],
        },
      });
      return;
    }
  }

  const welcomeText = `👋 ¡Bienvenido a OpenLearning, ${name}!

Soy tu asistente de aprendizaje personalizado.
Aquí puedes aprender cualquier tema con cursos 
creados por la comunidad y potenciados por IA.

¿Qué te gustaría hacer hoy?`;

  await ctx.reply(welcomeText, { reply_markup: mainKeyboard });
});

// Handle 'Volver' button
bot.callbackQuery("menu_main", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("¿Qué te gustaría hacer hoy?", { reply_markup: mainKeyboard });
});
