export interface ToolCall {
  type: "tool_call";
  tool: string;
  arguments: Record<string, any>;
}

export interface FinalAnswer {
  type: "final";
  content: string;
}

export type AgentOutput =
  | ToolCall
  | FinalAnswer;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentAction {
  action: "edit_file" | "run_tests";
  path: string;
  patch?: string;
}