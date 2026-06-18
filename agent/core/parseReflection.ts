export function parseReflection(
  text: string
) {
  try {
    return JSON.parse(text);
  } catch {
    return {
      improvements: [],
      risks: [],
    };
  }
}