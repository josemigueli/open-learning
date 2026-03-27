import { InlineKeyboard } from "grammy";

export const mainKeyboard = new InlineKeyboard()
  .text("📚 Cursos", "menu_courses")
  .text("▶️ Continuar", "menu_continue")
  .row()
  .text("🎯 Repasar", "menu_flashcards")
  .row()
  .text("⚙️ Configuración", "menu_config")
  .text("❓ Ayuda", "menu_help");

export function buildCoursesKeyboard(courses: { id: string; title: string; level: string }[]) {
  const keyboard = new InlineKeyboard();

  courses.forEach((course) => {
    keyboard.text(`${course.title} (${course.level})`, `course_${course.id}`).row();
  });

  keyboard.text("⬅️ Volver", "menu_main");
  return keyboard;
}
