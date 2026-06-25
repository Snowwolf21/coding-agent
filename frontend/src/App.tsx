import { useState, useEffect, useRef } from "react";
import { Icons } from "./components/Icons";
import FileNode from "./components/FileNode";
import { useMonacoEditor } from "./components/useMonacoEditor";
import getLanguageByExtension from "./components/getLanguageExtention";
import type { WorkspaceFile, ChatMessage } from "./types";
import loadFiles from "./components/loadFile";
import saveFiles from "./components/saveFile";
import handleSendMessages from "./components/handleSendMessage";
import Button from "./components/button";
import "./App.css";


declare global {
  interface Window {
    monaco?: Record<string, unknown>;
    require?: (dependencies: string[], callback: (...modules: unknown[]) => void) => void;
  }
}




const { Terminal: TerminalIcon, Settings: SettingsIcon } = Icons;
const INITIAL_FILES: WorkspaceFile[] = [
  { name: "package.json", type: "file" },
  { name: "tsconfig.json", type: "file" },
  {
    name: "agent",
    type: "folder",
    children: [
      { name: "orchestrator.ts", type: "file" },
      { name: "agent.ts", type: "file" },
    ],
  },
  {
    name: "src",
    type: "folder",
    children: [{ name: "index.ts", type: "file" }],
  },
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Welcome back! I am your AI Developer Agent. Ask me to build a feature, write tests, or fix a bug in your workspace.",
  },
];

type RunMode = "orchestrate" | "direct-chat";

export default function App() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [runMode, setRunMode] = useState<RunMode>("orchestrate");

  const [chat, setChat] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [files] = useState<WorkspaceFile[]>(INITIAL_FILES);

  const { code, setCode, filePath, setFilePath, containerRef } = useMonacoEditor();

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const loadFile = loadFiles({
    setFilePath,
    setCode,
    setChat,
  });

  const saveFile = saveFiles({
    filePath,
    code,
    setChat,
  });

  const handleSendMessage = handleSendMessages({
    setChat,
    code,
    filePath,
    setLoading,
    runMode,
    message,
    setMessage,
  });

 
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-blue-300 text-slate-100 font-sans">

      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/90 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Workspace
            </h1>
          </div>

          <Button className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            🔄
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {files.map((file) => (
            <FileNode
              key={file.name}
              item={file}
              onFileSelect={loadFile}
            />
          ))}
        </div>

        <div className="border-t border-slate-800 p-2">
          <Button
            onClick={saveFile}
            className="w-full rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium hover:bg-indigo-700"
          >
            Save File
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/40 p-3">
          <div className="flex items-center">
            <TerminalIcon />
            <span className="font-mono text-xs text-slate-500">
              localhost:3001
            </span>
          </div>
          <SettingsIcon />
        </div>
      </aside>

      {/* CHAT */}
      <section className="w-105 shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">

        <div className="border-b border-slate-800 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200">
              AI Assistant
            </h2>

            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
              {(["orchestrate", "direct-chat"] as RunMode[]).map((mode) => (
                <Button
                  key={mode}
                  onClick={() => setRunMode(mode)}
                  className={`px-2 py-1 text-xs rounded ${
                    runMode === mode
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400"
                  }`}
                >
                  {mode === "orchestrate" ? "Orchestrate" : "Chat"}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            {runMode === "orchestrate"
              ? "⚡ Autonomous coding workflow enabled."
              : "💬 Conversational assistant mode enabled."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chat.map((msg, idx) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={`${msg.role}-${idx}`}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div className="mb-1 text-[10px] uppercase text-slate-500">
                  {isUser ? "You" : "Agent"}
                </div>

                <div
                  className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm ${
                    isUser
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-700/50 bg-slate-800"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">
                   
                {typeof msg.content === "string"
                  ? msg.content
                  : JSON.stringify(msg.content)}

                  </pre>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="text-xs text-slate-500 animate-pulse">
              {runMode === "direct-chat"
                ? "Opening response stream..."
                : "Agent is thinking..."}
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-slate-800 bg-slate-950/40 p-4">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              runMode === "orchestrate"
                ? "Ask agent to resolve issue..."
                : "Chat with assistant..."
            }
            className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
          />

          <Button
            onClick={handleSendMessage}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-700"
          >
            Send
          </Button>
        </div>
      </section>

      {/* EDITOR */}
      <main className="flex flex-1 flex-col bg-slate-950">
        <div className="border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
          📝 {filePath} | {getLanguageByExtension(filePath)}
        </div>

        <div
          ref={containerRef}
          className="h-full flex-1"
        />
      </main>
    </div>
  );
}
