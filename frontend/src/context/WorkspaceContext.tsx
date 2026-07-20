import React, { useState, useEffect, useRef } from "react";
import type { WorkspaceFile, ChatMessage } from "../types";
import { WorkspaceContext } from "./WorkspaceContextObject";
import type { RunMode } from "./WorkspaceContextObject";

const originalConsoleWarn = console.warn;
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
const API_KEY = import.meta.env.VITE_API_KEY || "";

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    ...(API_KEY ? { "Authorization": `Bearer ${API_KEY}` } : {})
  };
};

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      addLog("⚠️ Stream generation aborted by user.");
      setChat((prev) => [
        ...prev,
        { role: "system", content: "⚠️ Generation stopped by user." }
      ]);
    }
  };

  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [filePath, setFilePath] = useState<string>("package.json");
  const [code, setCode] = useState<string>(`// Welcome to Monaco Editor!\n// Open a file from the explorer or ask the AI to write some code.`);
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Welcome back! I am your AI Developer Agent. Ask me to build a feature, write tests, or fix a bug in your workspace."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [runMode, setRunMode] = useState<RunMode>("direct-chat");
  const [message, setMessage] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "⚙️ System: Workspace initialized successfully.",
    "🤖 Agent: Ready to receive commands."
  ]);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [chatWidth, setChatWidth] = useState(380);
  const [sessionId] = useState(() => `sess-${Math.random().toString(36).substring(2, 11)}`);

  const addLog = (msg: string) => {
    setTerminalLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const clearLogs = () => setTerminalLogs([]);

  // Fetch dynamic workspace files list from server
  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE}/list-files`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error("Could not contact files server");
      const data = await response.json();
      if (data.success && Array.isArray(data.files)) {
        setFiles(data.files);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Failed to load workspace files:", error);
      addLog(`⚠️ Workspace scanner warning: ${error.message}`);
    }
  };

  const refreshFiles = async () => {
    addLog("⚙️ System: Scanning files tree...");
    await fetchFiles();
  };

  // Connect to SSE log stream on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFiles(); // Initial files load

    const tokenQuery = API_KEY ? `?token=${encodeURIComponent(API_KEY)}` : "";
    const eventSource = new EventSource(`${API_BASE}/logs/stream${tokenQuery}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.log) {
          setTerminalLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${data.log}`]);
        }
      } catch (err) {
        console.error("Failed to parse log stream payload:", err);
      }
    };

    eventSource.onerror = () => {
      originalConsoleWarn("Server logs stream disconnected, attempting reconnect...");
    };

    return () => {
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Load a file's content
  const loadFile = async (selectedPath: string) => {
    setFilePath(selectedPath);
    addLog(`📁 Opening file: ${selectedPath}...`);
    try {
      const response = await fetch(`${API_BASE}/read-file`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ filePath: selectedPath })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Filesystem read failure");

      setCode(data.data);
      addLog(`📁 Opened file: ${selectedPath}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("File loading error:", error);
      addLog(`❌ Failed to read file: ${selectedPath} (${error.message})`);
      setChat((prev) => [
        ...prev,
        { role: "system", content: `❌ Failed to read file: ${selectedPath} (${error.message})` }
      ]);
    }
  };

  // Save active file's content
  const saveFile = async () => {
    addLog(`📝 Saving file: ${filePath}...`);
    try {
      const response = await fetch(`${API_BASE}/write-file`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ filePath, content: code })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Filesystem write failure");

      addLog(`💾 Saved: ${filePath}`);
      setChat((prev) => [
        ...prev,
        { role: "system", content: `💾 Saved: ${filePath}` }
      ]);
      await fetchFiles();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("File save error:", error);
      addLog(`❌ Save failed: ${error.message}`);
      setChat((prev) => [
        ...prev,
        { role: "system", content: `❌ Save failed: ${error.message}` }
      ]);
    }
  };

  // Detect coding intent keywords
  const isCodingTask = (prompt: string): boolean => {
    const text = prompt.toLowerCase();
    const keywords = [
      "build", "create", "implement", "generate", "write", "code", "fix",
      "bug", "debug", "edit", "modify", "update", "refactor", "optimize",
      "feature", "component", "function", "class", "typescript", "javascript",
      "react", "next", "node", "express", "api", "server", "frontend",
      "backend", "database", "sql", "mongodb", "prisma", "tailwind", "css", "html"
    ];
    return keywords.some((keyword) => text.includes(keyword));
  };

  // Send Prompt handler
  const handleSendMessage = async () => {
    const outgoingMessage = message.trim();
    if (!outgoingMessage) return;

    setChat((prev) => [...prev, { role: "user", content: outgoingMessage }]);
    setMessage("");
    setLoading(true);

    addLog(`👤 Sent message: "${outgoingMessage}"`);
    addLog(`🤖 Agent: Running task... Mode: ${runMode}`);

    try {
      if (runMode === "direct-chat") {
        let streamed = "";
        let received = false;

        setChat((prev) => [...prev, { role: "assistant", content: "" }]);

        console.log("Client SSE: Connecting to /chat/stream...");
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const response = await fetch(`${API_BASE}/chat/stream`, {
          method: "POST",
          headers: {
            ...getHeaders(),
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            prompt: outgoingMessage,
            sessionId
          }),
          signal: controller.signal
        });
        console.log("Client SSE: Response status received:", response.status);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!response.body) throw new Error("SSE body payload is missing");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        console.log("Client SSE: Entering reader loop");
        while (true) {
          const { value, done } = await reader.read();
          console.log("Client SSE: Chunk read. done =", done, "value length =", value?.length);
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            console.log("Client SSE: Parsing frame:", frame);
            const lines = frame.split("\n");
            const event = lines.find((l) => l.startsWith("event:"))?.slice(6).trim() || "message";
            const dataLines = lines.filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim());

            if (!dataLines.length) continue;
            const parsedData = JSON.parse(dataLines.join("\n"));
            console.log("Client SSE: Event type =", event, "Payload =", parsedData);

            if (event === "token") {
              received = true;
              streamed += parsedData.token ?? "";
              
              setChat((prev) =>
                prev.map((msg, index) =>
                  index === prev.length - 1
                    ? { ...msg, content: streamed }
                    : msg
                )
              );
            }

            if (event === "error") {
              throw new Error(parsedData.message);
            }
          }
        }

        if (!received) {
          setChat((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? { ...msg, content: "No response received." }
                : msg
            )
          );
        }
        
        addLog(`🤖 Agent: Task completed.`);
        return;
      }

      // Orchestrate / Post Chat Mode
      const endpoint = isCodingTask(outgoingMessage) ? "/orchestrate" : "/chat";
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          prompt: outgoingMessage,
          filePath,
          code,
          sessionId
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || data.message || "Endpoint error");
      }

      const assistantMessage = data.message ?? data.content ?? data.result ?? "No response";

      setChat((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
      addLog(`🤖 Agent: Task completed.`);
      
      await fetchFiles();
      if (endpoint === "/orchestrate" && data.filePath) {
        await loadFile(data.filePath);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Chat error:", error);
      addLog(`❌ Chat failed: ${error.message}`);
      setChat((prev) => [
        ...prev,
        { role: "system", content: `❌ ${error.message}` }
      ]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
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
        sessionId,
        setFilePath,
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
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}


