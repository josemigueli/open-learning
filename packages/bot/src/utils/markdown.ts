import { marked } from "marked";

/**
 * Escapes characters that are special in Telegram HTML mode
 * (except those inside the tags we explicitly allow).
 *
 * According to Telegram Docs, supported HTML tags are:
 * <b>, <strong>, <i>, <em>, <u>, <ins>, <s>, <strike>, <del>
 * <span> (with class="tg-spoiler"), <a>, <code>, <pre>, <blockquote>
 */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Converts standard Markdown to Telegram-compatible HTML.
 * Telegram has very strict HTML requirements.
 */
export function markdownToTelegramHtml(markdown: string): string {
  // First, parse the markdown to HTML using marked
  let html = marked.parse(markdown, { async: false }) as string;

  // Telegram doesn't support <p>, <h1>, <h2>, <ul>, <li> etc directly as block elements
  // We need to convert them to something Telegram understands or strip them while keeping newlines.

  html = html
    // Convert Headers to Bold with double newline
    .replace(/<h[1-6]>(.*?)<\/h[1-6]>/g, "<b>$1</b>\n\n")

    // Remove paragraph tags (Telegram doesn't support them)
    .replace(/<\/?p>/g, "")

    // Convert lists
    .replace(/<ul>/g, "")
    .replace(/<\/ul>/g, "")
    .replace(/<ol(.*?)>/g, "")
    .replace(/<\/ol>/g, "")
    .replace(/<li>(.*?)<\/li>/g, "• $1\n")

    // Convert blockquotes to <blockquote> (Telegram supports this but only single-level)
    .replace(/<blockquote>/g, "<blockquote>")
    .replace(/<\/blockquote>/g, "</blockquote>\n\n")

    // Convert emphasis
    .replace(/<strong>(.*?)<\/strong>/g, "<b>$1</b>")
    .replace(/<em>(.*?)<\/em>/g, "<i>$1</i>")

    // Code blocks are already <pre><code>...</code></pre> which Telegram supports

    // Inline code is <code>...</code> which Telegram supports

    // Links are <a href="...">...</a> which Telegram supports

    // Clean up excessive newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return html;
}
