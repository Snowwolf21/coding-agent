export type EditAction = {
  action: "edit_file";
  path: string;
  patch: string;
};

export const conversationHistory: { 
  role: "user" | "system" | "assistant" | "tool"; 
  content: string; 
  name?: string | undefined;         
  tool_call_id?: string | undefined; 
}[] = [];