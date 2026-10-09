// utils/htmlDecoder.ts
export function decodeHtmlEntities(html: string): string {
    if (typeof window === 'undefined') {
      // Server-side: use a simple replacement
      return html
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    } else {
      // Client-side: use textarea element
      const textarea = document.createElement('textarea');
      textarea.innerHTML = html;
      return textarea.value;
    }
  }
  
  // Alternative: More comprehensive server-side decoding
  export function decodeHtmlEntitiesComprehensive(html: string): string {
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));
  }