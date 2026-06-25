
import express from "express";
import cors from "cors";
import { promises as fs } from "fs";
import { agent } from "../agent/agent.js";
import { orchestrate } from "./core/orchestrator.js";
import { acceptEdit } from "./core/applyEditActions.js";
import { rejectEdit } from "./core/rejectEditAction.js";
import { agentState } from "./state.js";
import { OllamaProvider } from "./llm/ollamaProvider.js";

const app = express();

app.use(cors());
app.use(express.json());

// LOGGING
app.use((req, _, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// SAFE RESPONSE NORMALIZER
function send(res: any, result: any) {
  return res.json({
    success: result.success ?? true,
    message: result.content ?? result.Content ?? "",
  });
}

function writeSse(res: any, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ORCHESTRATE
app.post("/orchestrate", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log(`🤖 Orchestrating task: "${prompt}"`);

    const result = await orchestrate(prompt);

    console.log("ORCHESTRATE RESULT:", result);

    res.json({
      success: result.success,
      message: result.success ? (result.result || "Orchestration completed successfully") : result.error,
      filePath: result.filePath,
      prSummary: result.prSummary,
      attempt: result.attempt,
    });
  } catch (error: any) {
    console.error("Orchestrate error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// CHAT
app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await agent([
      {
        role: "user",
        content: prompt,
      },
    ]);

    const latestSuggestion =
      agentState.project.suggestions.at(-1);

    res.json({
      success: true,
      content:result.content,
      editId: latestSuggestion?.id,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// STREAMING CHAT
app.post("/chat/stream", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({
      success: false,
      message: "Prompt is required",
    });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let closed = false;
  req.on("close", () => {
    closed = true;
  });

  try {
    const provider = new OllamaProvider();
    writeSse(res, "ready", { success: true });

    for await (const token of provider.stream([
      { role: "user", content: prompt },
    ])) {
      if (closed) return;
      writeSse(res, "token", { token });
    }

    if (!closed) {
      writeSse(res, "done", { success: true });
      res.end();
    }
  } catch (err: any) {
    if (!closed) {
      writeSse(res, "error", {
        success: false,
        message: err.message,
      });
      res.end();
    }
  }
});

// ACCEPT EDIT SUGGESTION
app.post("/accept", async (req, res) => {
  try {
    const id = Number(req.body.id);
    console.log(`✅ Accepting edit suggestion: ${id}`);
    const result = acceptEdit(id);
    res.json({
      success: !result.startsWith("❌"),
      message: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// REJECT EDIT SUGGESTION
app.post("/reject", async (req, res) => {
  try {
    const id = Number(req.body.id);
    console.log(`❌ Rejecting edit suggestion: ${id}`);
    const result = rejectEdit(id);
    res.json({
      success: !result.startsWith("❌"),
      message: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// READ FILE
app.post("/read-file", async (req, res) => {
  try {
    const { filePath } = req.body;
    const data = await fs.readFile(filePath, "utf8");
    res.json({ success: true, data });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

// WRITE FILE
app.post("/write-file", async (req, res) => {
  try {
    const { filePath, content } = req.body;
    await fs.writeFile(filePath, content, "utf8");
    res.json({ success: true });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

// HEALTH CHECK
app.get("/health", (_, res) => {
  res.json({ success: true, message: "ok" });
});

// 404 JSON ONLY (NO HTML EVER)
app.use((_, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = 3001;
const HOST = "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
