export const getFullImageUrl = (url: string): string => {
    if (!url) return "";
    // If URL is already absolute, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    // Construct full URL from API base
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
};