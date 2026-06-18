export function parseDebugger(
  text: string
) {
  try {
    return JSON.parse(text);
  } catch {
    return {
      fixes: [],
    };
  }
}