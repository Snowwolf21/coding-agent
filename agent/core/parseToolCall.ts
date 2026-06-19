export interface ToolCall {
  type: "tool_call";
  tool: string;
  arguments: Record<string, any>;
}

export function parseToolCall(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}