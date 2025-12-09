export function shortenText(text: string, maxLength: number): string {
    if (!text) return "";
    if (text.length > maxLength) {
        return text.substring(0, maxLength - 3) + "...";
    }
    return text;
}

