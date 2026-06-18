export function tryParseOutput(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}