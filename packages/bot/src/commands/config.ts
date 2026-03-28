import { InlineKeyboard } from "grammy";
import { UserService } from "@open-learning/core";
import { bot } from "../bot.js";
import { markdownToTelegramHtml } from "../utils/markdown.js";

interface ContextWithReply {
  from?: { id: number };
  reply: (text: string, options?: object) => Promise<unknown>;
}

export async function showConfigMenu(ctx: ContextWithReply) {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const user = await UserService.getUser(telegramId);
  if (!user) return ctx.reply("Usuario no encontrado.");

  const kb = new InlineKeyboard()
    .text("Nivel: " + (user.preferredLevel || "beginner"), "config_level")
    .row()
    .text("⬅️ Volver", "menu_main");

  await ctx.reply(
    markdownToTelegramHtml("⚙️ **Configuración**\n\nAquí puedes ajustar tus preferencias:"),
    {
      parse_mode: "HTML",
      reply_markup: kb,
    }
  );
}

bot.command("config", async (ctx) => {
  await showConfigMenu(ctx);
});

bot.callbackQuery("config_level", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter("configLevelConversation");
});
