import { createContext } from "react";
import type { WorkspaceFile, ChatMessage } from "../types";

export type RunMode = "orchestrate" | "direct-chat";

export interface WorkspaceContextProps {
  files: WorkspaceFile[];
  filePath: string;
  code: string;
  chat: ChatMessage[];
  loading: boolean;
  runMode: RunMode;
  message: string;
  terminalLogs: string[];
  isTerminalExpanded: boolean;
  sidebarWidth: number;
  chatWidth: number;
  sessionId: string;
  setFilePath: (path: string) => void;
  setCode: (code: string) => void;
  setRunMode: (mode: RunMode) => void;
  setMessage: (msg: string) => void;
  setIsTerminalExpanded: (expanded: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setChatWidth: (width: number) => void;
  clearLogs: () => void;
  refreshFiles: () => Promise<void>;
  loadFile: (path: string) => Promise<void>;
  saveFile: () => Promise<void>;
  handleSendMessage: () => Promise<void>;
  stopGenerating: () => void;
}

export const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);
