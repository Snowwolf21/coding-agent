export interface ToolCall {
  type: "tool_call";
  tool: string;
  arguments: Record<string, any>;
}

export interface FinalAnswer {
  type: "final";
  content: any;
}

export type AgentOutput =
  | ToolCall
  | FinalAnswer;