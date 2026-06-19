export function parseLLMOutput(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}