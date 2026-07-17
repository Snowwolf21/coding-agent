import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Icons } from "./components/Icons";
import FileNode from "./components/FileNode";
import Button from "./components/button";
import MarkdownRenderer from "./components/MarkdownRenderer";
import getLanguageByExtension from "./components/getLanguageExtention";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { useWorkspace } from "./hooks/useWorkspace";
import "./App.css";

const { Terminal: TerminalIcon, Settings: SettingsIcon } = Icons;

type RunMode = "orchestrate" | "direct-chat";

function WorkspaceInner() {
  const {
    files,
    filePath,
    code,
    chat,
    loading,
    runMode,
    message,
    terminalLogs,
    isTerminalExpanded,
    sidebarWidth,
    chatWidth,
    setCode,
    setRunMode,
    setMessage,
    setIsTerminalExpanded,
    setSidebarWidth,
    setChatWidth,
    clearLogs,
    refreshFiles,
    loadFile,
    saveFile,
    handleSendMessage,
    stopGenerating
  } = useWorkspace();

  // Mouse drag references for split pane resizer
  const sidebarDragRef = useRef(false);
  const chatDragRef = useRef(false);
  const sidebarWidthRef = useRef(sidebarWidth);

  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // Drag handlers
  const handleSidebarMouseDown = () => {
    sidebarDragRef.current = true;
    document.addEventListener("mousemove", handleSidebarMouseMove);
    document.addEventListener("mouseup", handleSidebarMouseUp);
  };

  const handleSidebarMouseMove = (e: MouseEvent) => {
    if (sidebarDragRef.current) {
      setSidebarWidth(Math.max(180, Math.min(450, e.clientX)));
    }
  };

  const handleSidebarMouseUp = () => {
    sidebarDragRef.current = false;
    document.removeEventListener("mousemove", handleSidebarMouseMove);
    document.removeEventListener("mouseup", handleSidebarMouseUp);
  };

  const handleChatMouseDown = () => {
    chatDragRef.current = true;
    document.addEventListener("mousemove", handleChatMouseMove);
    document.addEventListener("mouseup", handleChatMouseUp);
  };

  const handleChatMouseMove = (e: MouseEvent) => {
    if (chatDragRef.current) {
      setChatWidth(Math.max(260, Math.min(600, e.clientX - sidebarWidthRef.current)));
    }
  };

  const handleChatMouseUp = () => {
    chatDragRef.current = false;
    document.removeEventListener("mousemove", handleChatMouseMove);
    document.removeEventListener("mouseup", handleChatMouseUp);
  };

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden bg-[#0B0F17] text-slate-100 font-sans antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* SIDEBAR PANEL */}
      <aside 
        style={{ width: `${sidebarWidth}px` }} 
        className="shrink-0 border-r border-slate-800/80 bg-slate-950/50 backdrop-blur-md flex flex-col relative z-20"
      >
        <div className="flex items-center justify-between border-b border-slate-800/80 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <h1 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Workspace
            </h1>
          </div>

          <Button 
            variant="custom"
            onClick={refreshFiles} 
            className="rounded p-1 text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all cursor-pointer"
          >
            🔄
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {files.map((file) => (
            <FileNode
              key={file.name}
              item={file}
              onFileSelect={loadFile}
            />
          ))}
        </div>

        <div className="border-t border-slate-800/80 p-3 bg-slate-950/20">
          <Button
            onClick={saveFile}
            variant="indigo"
            size="sm"
            className="w-full py-2 font-semibold shadow-[0_0_12px_rgba(99,102,241,0.15)]"
          >
            Save File
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/40 p-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="text-indigo-400 w-3.5 h-3.5" />
            <span className="font-mono text-[11px] text-slate-500">
              localhost:3001
            </span>
          </div>
          <SettingsIcon className="text-slate-500 hover:text-slate-300 w-3.5 h-3.5 cursor-pointer transition-colors" />
        </div>
      </aside>

      {/* Resize Handle 1 */}
      <div
        onMouseDown={handleSidebarMouseDown}
        className="w-1 hover:w-1.5 bg-slate-800/40 hover:bg-indigo-500/50 cursor-col-resize transition-all shrink-0 z-30"
      />

      {/* CHAT PANEL */}
      <section 
        style={{ width: `${chatWidth}px` }} 
        className="shrink-0 border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col relative z-20"
      >
        <div className="border-b border-slate-800/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
              AI Assistant
            </h2>

            <div className="flex rounded-md border border-slate-800 bg-slate-950/80 p-0.5">
              {(["orchestrate", "direct-chat"] as RunMode[]).map((mode) => (
                <Button
                  key={mode}
                  onClick={() => setRunMode(mode)}
                  variant="custom"
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                    runMode === mode
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode === "orchestrate" ? "Orchestrate" : "Chat"}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            {runMode === "orchestrate"
              ? "⚡ Autonomous coding mode enabled. Full project scope routing."
              : "💬 Conversation assistant active. Direct LLM chat streaming."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {chat.map((msg, idx) => {
            const isUser = msg.role === "user";
            const isSystem = msg.role === "system";

            if (isSystem) {
              return (
                <div key={idx} className="border border-yellow-500/20 bg-yellow-500/5 text-yellow-300 font-mono text-[11px] rounded-lg p-3 my-2 shadow-inner">
                  {msg.content}
                </div>
              );
            }

            return (
              <div
                key={`${msg.role}-${idx}`}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  {isUser ? "You" : "Agent"}
                </div>

                <div
                  className={`max-w-[95%] rounded-2xl px-4 py-3 shadow-md border ${
                    isUser
                      ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-indigo-500/30 rounded-tr-sm"
                      : "bg-slate-900/60 border-slate-800/80 text-slate-200 rounded-tl-sm"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="relative">
                      <MarkdownRenderer content={msg.content} />
                      {loading && idx === chat.length - 1 && (
                        <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-400 animate-pulse align-middle" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="animate-pulse">
                {runMode === "direct-chat"
                  ? "Opening response stream..."
                  : "Agent is analyzing workspace..."}
              </span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-slate-800/80 bg-slate-950/30 p-4">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              runMode === "orchestrate"
                ? "Ask agent to write some code or fix a bug..."
                : "Ask anything about the workspace..."
            }
            className="flex-1 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/80 transition-colors"
          />

          {loading && runMode === "direct-chat" && (
            <Button
              onClick={stopGenerating}
              variant="danger"
              className="rounded-lg py-2.5 px-3.5 font-semibold text-xs tracking-wider uppercase cursor-pointer"
            >
              Stop
            </Button>
          )}

          <Button
            onClick={handleSendMessage}
            variant="indigo"
            className="rounded-lg py-2.5 px-4 font-semibold text-xs tracking-wider uppercase cursor-pointer"
          >
            Send
          </Button>
        </div>
      </section>

      {/* Resize Handle 2 */}
      <div
        onMouseDown={handleChatMouseDown}
        className="w-1 hover:w-1.5 bg-slate-800/40 hover:bg-indigo-500/50 cursor-col-resize transition-all shrink-0 z-30"
      />

      {/* EDITOR & TERMINAL VIEWPORT CONTAINER */}
      <main className="flex flex-1 flex-col bg-[#07090E] relative overflow-hidden">
        {/* Editor Wrapper */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="border-b border-slate-800/80 bg-slate-950/30 px-4 py-3 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>📝 {filePath} | {getLanguageByExtension(filePath)}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Active Workspace</span>
          </div>

          <div className="flex-1 min-h-0 bg-[#1e293b]">
            <Editor
              height="100%"
              language={getLanguageByExtension(filePath)}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>

        {/* BOTTOM TERMINAL PANEL */}
        <div className={`border-t border-slate-800/80 bg-slate-950/85 backdrop-blur flex flex-col transition-all duration-300 ease-in-out z-10 ${isTerminalExpanded ? "h-48" : "h-10"}`}>
          {/* Terminal Header */}
          <div 
            onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
            className="flex items-center justify-between bg-slate-900/60 px-4 py-2 text-slate-400 border-b border-slate-850 hover:bg-slate-900 hover:text-white cursor-pointer select-none transition-colors"
          >
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-wider">
              <span className={`h-1.5 w-1.5 rounded-full ${isTerminalExpanded ? "bg-indigo-500 animate-pulse" : "bg-indigo-700"}`} />
              Console Logs
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  clearLogs();
                }}
                className="text-[10px] hover:text-red-400 transition-colors uppercase font-bold tracking-widest px-1.5 py-0.5 rounded hover:bg-slate-800"
              >
                Clear
              </button>
              <span className="text-[11px]">{isTerminalExpanded ? "▼" : "▲"}</span>
            </div>
          </div>

          {/* Terminal Content */}
          {isTerminalExpanded && (
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1.5 text-slate-400 scrollbar-thin bg-black/40">
              {terminalLogs.map((log, index) => (
                <div key={index} className="leading-relaxed hover:text-slate-200 transition-colors whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceInner />
    </WorkspaceProvider>
  );
}
