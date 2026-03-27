import { InlineKeyboard } from "grammy";
import {
  CertificateService,
  ProgressService,
  UserService,
  CourseService,
} from "@open-learning/core";
import type { BotContext } from "../bot.js";
import { bot } from "../bot.js";
import { markdownToTelegramHtml } from "../utils/markdown.js";

async function showProgress(ctx: BotContext) {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const user = await UserService.getUser(telegramId);
  if (!user) {
    return ctx.reply("👋 ¡Hola! Primero usa /start para registrarte y ver tu progreso.");
  }

  const courses = await CourseService.listPublicCourses();
  if (courses.length === 0) {
    return ctx.reply(
      "📚 Todavía no hay cursos publicados. En breve vas a tener contenido nuevo para arrancar."
    );
  }

  const lines: string[] = [
    "📊 **Tu Panel de Progreso**",
    "",
    "Acá podés ver cómo venís en cada curso y desbloquear tus certificados al completar todo.",
    "",
  ];
  const certificatesKb = new InlineKeyboard();
  let hasCertificates = false;
  let hasAnyProgress = false;

  for (const course of courses) {
    const courseProgress = await ProgressService.getCourseProgress(user.id, course.id);
    const completed = courseProgress.filter((p) => p.status === "completed").length;
    const avgScore =
      completed > 0
        ? Math.round(courseProgress.reduce((sum, p) => sum + (p.score ?? 0), 0) / completed)
        : 0;

    lines.push(`📚 **${course.title}**`);
    lines.push(`  ✅ Completadas: ${completed}`);
    if (completed > 0) lines.push(`  🎯 Promedio: ${avgScore}%`);
    if (completed > 0) hasAnyProgress = true;

    const courseDetails = await CourseService.getCourse(course.id);
    const totalLessons =
      courseDetails?.metadata?.modules.reduce((acc, mod) => acc + mod.lessons.length, 0) ?? 0;

    if (totalLessons > 0 && completed >= totalLessons) {
      lines.push("  🏆 Curso finalizado: certificado disponible");

      const cert = await CertificateService.issueCertificate(user.id, course.id);
      const appUrl = process.env.WEB_URL || "http://localhost:5173";
      const certificateParams = new URLSearchParams({
        name: user.name,
        course: course.title,
        issuedAt: cert.issuedAt?.toISOString() ?? new Date().toISOString(),
      });
      const certUrl = `${appUrl}/cert/${cert.id}?${certificateParams.toString()}`;

      certificatesKb.url(`🎓 Ver certificado: ${course.title}`, certUrl).row();
      hasCertificates = true;
    }

    lines.push("");
  }

  if (!hasAnyProgress) {
    lines.push("Todavía no tenés progreso registrado.");
    lines.push("Escribí /cursos para empezar tu primera lección.");
  }

  await ctx.reply(markdownToTelegramHtml(lines.join("\n")), {
    parse_mode: "HTML",
    reply_markup: hasCertificates ? certificatesKb : undefined,
  });
}

bot.command("progreso", showProgress);

bot.callbackQuery("menu_progress", async (ctx) => {
  await ctx.answerCallbackQuery();
  await showProgress(ctx);
});
