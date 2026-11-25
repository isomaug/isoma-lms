export function calculateReadingTime(htmlContent) {
  if (!htmlContent) return "1 min read";

  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>?/gm, "");

  // Count words (split by whitespace)
  const wordCount = text.trim().split(/\s+/).length;

  // Average reading speed is roughly 200 words per minute
  const readingTime = Math.ceil(wordCount / 200);

  return `${readingTime} min read`;
}
