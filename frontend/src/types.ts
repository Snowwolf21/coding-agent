export interface WorkspaceFile {
  name: string;
  type: "file" | "folder";
  children?: WorkspaceFile[];
}

export interface WorkspaceFileNode {
  name: string;
  type: "file" | "folder";
  children?: WorkspaceFileNode[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}