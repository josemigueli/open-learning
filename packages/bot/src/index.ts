/* eslint-disable no-console */
import { run } from "@grammyjs/runner";
import { type BotError } from "grammy";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { CourseService, UserService } from "@open-learning/core";
import { bot } from "./bot.js";
// Conversations MUST be registered before global handlers
import "./commands/config.js";
// Global handlers
import "./commands/courses.js";
import "./commands/flashcards.js";
import "./commands/menu.js";
import "./commands/progress.js";
import "./commands/start.js";
import "./commands/study.js";

// Error boundary
bot.catch(async (err: BotError) => {
  console.error("Error in bot:", err);
  const ctx = err.ctx;
  try {
    await ctx.reply(
      "❌ Ups, ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde."
    );
  } catch (e) {
    console.error("Could not send error message to user:", e);
  }
});

// Startup
async function main() {
  console.log("Starting OpenLearning Bot...");

  // Register default courses
  try {
    const systemUser = await UserService.getOrCreateUser("system", "System");
    const coursesDir = path.resolve(process.cwd(), "courses/examples");
    const dirs = await fs.readdir(coursesDir, { withFileTypes: true });

    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const coursePath = path.join(coursesDir, dir.name);
        await CourseService.registerCourse(coursePath, systemUser.id);
        console.log(`Registered course: ${dir.name}`);
      }
    }
  } catch (error) {
    console.error("Error registering default courses:", error);
  }

  run(bot);
  console.log("Bot is running!");
}

main().catch(console.error);
