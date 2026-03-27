import { InlineKeyboard } from "grammy";
import { UserService } from "@open-learning/core";
import { type BotConversation, type BaseContext } from "../bot.js";
import { markdownToTelegramHtml } from "../utils/markdown.js";

export async function configLevelConversation(conversation: BotConversation, ctx: BaseContext) {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const kb = new InlineKeyboard()
    .text("Principiante", "level_beginner")
    .row()
    .text("Intermedio", "level_intermediate")
    .row()
    .text("Avanzado", "level_advanced")
    .row()
    .text("❌ Cancelar", "config_cancel");

  await ctx.reply(
    markdownToTelegramHtml(
      "🎓 **Selecciona tu nivel preferido:**\n\nEsto ajustará la dificultad de las preguntas generadas por IA."
    ),
    {
      parse_mode: "HTML",
      reply_markup: kb,
    }
  );

  const responseCtx = await conversation.waitForCallbackQuery(
    /^(level_beginner|level_intermediate|level_advanced|config_cancel)$/
  );
  await responseCtx.answerCallbackQuery();

  if (responseCtx.match[0] === "config_cancel") {
    await ctx.reply("Operación cancelada.");
    return;
  }

  let newLevel = "beginner";
  if (responseCtx.match[0] === "level_intermediate") newLevel = "intermediate";
  if (responseCtx.match[0] === "level_advanced") newLevel = "advanced";

  await conversation.external(() =>
    UserService.updateConfig(telegramId, { preferredLevel: newLevel })
  );

  await ctx.reply(markdownToTelegramHtml(`✅ Nivel actualizado a: **${newLevel}**`), {
    parse_mode: "HTML",
  });
}
