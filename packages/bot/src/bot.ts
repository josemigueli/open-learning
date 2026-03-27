import { conversations, type Conversation, type ConversationFlavor } from "@grammyjs/conversations";
import "dotenv/config";
import { Bot, type Context, session, type SessionFlavor } from "grammy";

// Typed session data
export interface SessionData {
  courseId?: string;
  flashcards?: { front: string; back: string }[];
  flashcardsLessons?: { path: string; title: string; moduleTitle: string }[];
  flashcardsCourseId?: string;
}

// Base context for internal conversation use (no ConversationFlavor to avoid recursion)
export type BaseContext = Context & SessionFlavor<SessionData>;

// Bot context for outside handlers (has ConversationFlavor)
export type BotContext = BaseContext & ConversationFlavor<BaseContext>;

// Updated BotConversation type with both outside and inside contexts
export type BotConversation = Conversation<BotContext, BaseContext>;

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN environment variable is not defined");
}

export const bot = new Bot<BotContext>(process.env.TELEGRAM_BOT_TOKEN);

// Session setup with typed initial data
bot.use(session({ initial: (): SessionData => ({}) }));
bot.use(conversations());
