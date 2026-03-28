import { bot, type BotContext } from "../bot.js";

bot.command("estudiar", async (ctx) => {
  await ctx.reply(
    "Usa el menú de cursos para seleccionar un curso y empezar a estudiar.\nPresiona /cursos"
  );
});

bot.callbackQuery(/^study_(.+)$/, async (ctx: BotContext) => {
  if (!ctx.match) return;
  const courseId = ctx.match[1];
  await ctx.answerCallbackQuery();

  // Save course selection to session for conversation
  ctx.session.courseId = courseId;

  // Enter conversation
  await ctx.conversation.enter("studyConversation");
});
