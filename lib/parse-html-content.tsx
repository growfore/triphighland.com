export function parseHTMLContent(html: string) {
  // const regex = /<p>\s*(\["packages".*?\])\s*<\/p>/g;
  const regex = /(\["packages".*?\])/g;

  const parts: any[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(html)) !== null) {
    // push normal HTML before match
    if (match.index > lastIndex) {
      parts.push({
        type: "html",
        content: html.slice(lastIndex, match.index),
      });
    }

    // parse shortcode
    try {
      const parsed = JSON.parse(match[1]);

      parts.push({
        type: "packages",
        config: parsed[1],
      });
    } catch (e) {
      console.error("Invalid shortcode");
    }

    lastIndex = regex.lastIndex;
  }

  // remaining content
  if (lastIndex < html.length) {
    parts.push({
      type: "html",
      content: html.slice(lastIndex),
    });
  }

  return parts;
}
