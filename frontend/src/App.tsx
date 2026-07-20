import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import Button from "./components/button";
import MarkdownRenderer from "./components/MarkdownRenderer";
import getLanguageByExtension from "./components/getLanguageExtention";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { useWorkspace } from "./hooks/useWorkspace";
import "./App.css";

type RunMode = "orchestrate" | "direct-chat";

function WorkspaceInner() {
  const {
    filePath,
    code,
    chat,
    loading,
    runMode,
    message,
    terminalLogs,
    isTerminalExpanded,
    chatWidth,
    setCode,
    setRunMode,
    setMessage,
    setIsTerminalExpanded,
    setChatWidth,
    clearLogs,
    saveFile,
    handleSendMessage,
    stopGenerating
  } = useWorkspace();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<"chat" | "editor">("chat");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chatDragRef = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const handleChatMouseDown = () => {
    chatDragRef.current = true;
    document.addEventListener("mousemove", handleChatMouseMove);
    document.addEventListener("mouseup", handleChatMouseUp);
  };

  const handleChatMouseMove = (e: MouseEvent) => {
    if (chatDragRef.current) {
      const maxAllowedWidth = Math.min(600, window.innerWidth * 0.6);
      setChatWidth(Math.max(260, Math.min(maxAllowedWidth, e.clientX)));
    }
  };

  const handleChatMouseUp = () => {
    chatDragRef.current = false;
    document.removeEventListener("mousemove", handleChatMouseMove);
    document.removeEventListener("mouseup", handleChatMouseUp);
  };

  return (
    <div 
      className="flex flex-col md:flex-row h-screen w-full max-w-full overflow-hidden bg-[#0B0F17] text-slate-100 font-sans antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Mobile Tab Header */}
      {isMobile && (
        <div className="flex bg-slate-950 border-b border-slate-800 text-xs font-bold uppercase tracking-wider shrink-0 z-30 w-full">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3.5 text-center transition-all cursor-pointer ${
              activeTab === "chat"
                ? "text-indigo-400 border-b-2 border-indigo-500 bg-slate-900/40"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            💬 AI Assistant
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex-1 py-3.5 text-center transition-all cursor-pointer ${
              activeTab === "editor"
                ? "text-indigo-400 border-b-2 border-indigo-500 bg-slate-900/40"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            📝 Monaco Editor
          </button>
        </div>
      )}

      {/* CHAT PANEL */}
      {(!isMobile || activeTab === "chat") && (
        <section 
          style={isMobile ? { width: "100%" } : { width: `${chatWidth}px` }} 
          className="w-full md:shrink-0 md:border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col relative z-20 h-full overflow-hidden"
        >
          {/* Chat Panel Header */}
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

          {/* Chat Logs List */}
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
                        ? "bg-linear-to-br from-indigo-600 to-violet-700 text-white border-indigo-500/30 rounded-tr-sm"
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

          {/* Chat Inputs */}
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
      )}

      {/* Resize Handle (Desktop Only) */}
      {!isMobile && (
        <div
          onMouseDown={handleChatMouseDown}
          className="w-1 hover:w-1.5 bg-slate-800/40 hover:bg-indigo-500/50 cursor-col-resize transition-all shrink-0 z-30"
        />
      )}

      {/* EDITOR & TERMINAL VIEWPORT CONTAINER */}
      {(!isMobile || activeTab === "editor") && (
        <main className="flex flex-1 flex-col bg-[#07090E] relative overflow-hidden h-full min-w-0 w-full">
          {/* Editor Wrapper */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="border-b border-slate-800/80 bg-slate-950/30 px-4 py-2.5 text-xs text-slate-400 flex items-center justify-between font-mono">
              <span>📝 {filePath} | {getLanguageByExtension(filePath)}</span>
              <div className="flex items-center gap-4">
                <Button
                  onClick={saveFile}
                  variant="indigo"
                  size="sm"
                  className="py-1 px-3 font-semibold text-[11px] shadow-[0_0_12px_rgba(99,102,241,0.15)] cursor-pointer"
                >
                  Save File
                </Button>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:inline">Active Workspace</span>
              </div>
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
      )}
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
