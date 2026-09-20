export function sanitizeMarkdown(content: string): string {
  return content
    .replace(/(\\n)/g, "\n")
    .replace(/(\d+\.\s)/g, "\n\n$1")
    .replace(/(Bây giờ,|Bạn có muốn|Hãy|Hoặc)/g, "\n\n$1");
}