import { CourseService } from "@open-learning/core";
import { type BaseContext } from "../bot.js";
import { buildCoursesKeyboard } from "../keyboards/main.keyboard.js";

export async function showCourses(ctx: BaseContext) {
  const courses = await CourseService.listPublicCourses();

  if (courses.length === 0) {
    return ctx.reply("No hay cursos disponibles en este momento.", {
      reply_markup: { inline_keyboard: [[{ text: "⬅️ Volver", callback_data: "menu_main" }]] },
    });
  }

  const kb = buildCoursesKeyboard(
    courses.map((c) => ({ id: c.id, title: c.title, level: c.level }))
  );

  await ctx.reply("📚 Cursos disponibles:", { reply_markup: kb });
}
