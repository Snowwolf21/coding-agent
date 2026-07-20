import express from "express";
import cors from "cors";
import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import { orchestrate } from "./core/orchestrator.js";
import { acceptEdit } from "./core/applyEditActions.js";
import { rejectEdit } from "./core/rejectEditAction.js";
import { OllamaProvider } from "./llm/ollamaProvider.js";
const app = express();
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : true,
    credentials: true,
}));
app.use(express.json());
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.resolve(process.cwd());
// Path safety check to block directory traversal attacks
function isPathSafe(targetPath) {
    if (!targetPath)
        return false;
    const absoluteTarget = path.resolve(WORKSPACE_ROOT, targetPath);
    return absoluteTarget.startsWith(WORKSPACE_ROOT);
}
// Scoped Sessions Cache
const chatSessions = new Map();
function getSessionHistory(sessionId) {
    const sid = sessionId || "default-session";
    if (!chatSessions.has(sid)) {
        chatSessions.set(sid, []);
    }
    return chatSessions.get(sid);
}
// Log streaming clients collection
const logClients = new Set();
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;
function formatLogMsg(args) {
    return args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
}
// Intercept server console outputs to stream them to clients via SSE
console.log = (...args) => {
    originalLog(...args);
    const msg = formatLogMsg(args);
    logClients.forEach(client => {
        client.write(`data: ${JSON.stringify({ log: `ℹ️ ${msg}` })}\n\n`);
    });
};
console.warn = (...args) => {
    originalWarn(...args);
    const msg = formatLogMsg(args);
    logClients.forEach(client => {
        client.write(`data: ${JSON.stringify({ log: `⚠️ ${msg}` })}\n\n`);
    });
};
console.error = (...args) => {
    originalError(...args);
    const msg = formatLogMsg(args);
    logClients.forEach(client => {
        client.write(`data: ${JSON.stringify({ log: `❌ ${msg}` })}\n\n`);
    });
};
// SSE console logs stream route
app.get("/logs/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    logClients.add(res);
    res.on("close", () => {
        logClients.delete(res);
    });
});
// Helper for dynamic workspace directory scanning
function scanDir(dir, baseDir) {
    const result = [];
    if (!fsSync.existsSync(dir))
        return [];
    const files = fsSync.readdirSync(dir);
    for (const file of files) {
        if (file === ".git" || file === "node_modules" || file === "dist" || file === "out" || file === ".DS_Store") {
            continue;
        }
        const fullPath = path.join(dir, file);
        const stat = fsSync.statSync(fullPath);
        if (stat.isDirectory()) {
            result.push({
                name: file,
                type: "folder",
                children: scanDir(fullPath, baseDir)
            });
        }
        else {
            result.push({
                name: file,
                type: "file"
            });
        }
    }
    return result.sort((a, b) => {
        if (a.type === b.type) {
            return a.name.localeCompare(b.name);
        }
        return a.type === "folder" ? -1 : 1;
    });
}
// GET dynamic files list
app.get("/list-files", (_, res) => {
    try {
        const filesTree = scanDir(WORKSPACE_ROOT, WORKSPACE_ROOT);
        res.json({ success: true, files: filesTree });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// JSON Helper
function writeSse(res, event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    res.flush?.();
}
// ORCHESTRATE
app.post("/orchestrate", async (req, res) => {
    try {
        const { prompt, sessionId } = req.body;
        console.log(`🤖 Orchestrating task: "${prompt}"`);
        const history = getSessionHistory(sessionId);
        const result = await orchestrate(prompt, history);
        console.log("ORCHESTRATE RESULT:", result);
        res.json({
            success: result.success,
            message: result.success ? (result.result || "Orchestration completed successfully") : result.error,
            filePath: result.filePath,
            prSummary: result.prSummary,
            attempt: result.attempt,
        });
    }
    catch (error) {
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
        const { prompt, sessionId } = req.body;
        const history = getSessionHistory(sessionId);
        history.push({ role: "user", content: prompt });
        const provider = new OllamaProvider();
        const response = await provider.generate(history);
        const text = response.text;
        history.push({ role: "assistant", content: text });
        res.json({ success: true, message: text });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});
// STREAMING CHAT
app.post("/chat/stream", async (req, res) => {
    const { prompt, sessionId } = req.body;
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
    res.on("close", () => {
        closed = true;
    });
    const history = getSessionHistory(sessionId);
    history.push({ role: "user", content: prompt });
    try {
        console.log("1. Starting chat session stream");
        const provider = new OllamaProvider();
        writeSse(res, "ready", {
            success: true,
        });
        console.log("2. Sent ready event");
        let fullResponse = "";
        console.log("3. Initiating Ollama stream request with history size:", history.length);
        for await (const token of provider.stream(history)) {
            if (closed) {
                console.log("⚠️ Client disconnected during stream");
                return;
            }
            process.stdout.write(token);
            fullResponse += token;
            writeSse(res, "token", { token });
        }
        console.log("\n4. Finished stream from Ollama");
        if (!closed) {
            history.push({ role: "assistant", content: fullResponse });
            writeSse(res, "done", { success: true });
            res.end();
            console.log("5. Sent done event and closed response");
        }
    }
    catch (err) {
        console.error("❌ Stream error:", err);
        if (!closed) {
            writeSse(res, "error", {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
        if (!isPathSafe(filePath)) {
            res.json({ success: false, error: "Access Denied: Path outside workspace bounds" });
            return;
        }
        const absolutePath = path.resolve(WORKSPACE_ROOT, filePath);
        const data = await fs.readFile(absolutePath, "utf8");
        res.json({ success: true, data });
    }
    catch (error) {
        res.json({ success: false, error: error.message });
    }
});
// WRITE FILE
app.post("/write-file", async (req, res) => {
    try {
        const { filePath, content } = req.body;
        if (!isPathSafe(filePath)) {
            res.json({ success: false, error: "Access Denied: Path outside workspace bounds" });
            return;
        }
        const absolutePath = path.resolve(WORKSPACE_ROOT, filePath);
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, content, "utf8");
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false, error: error.message });
    }
});
// HEALTH CHECK
app.get("/health", (_, res) => {
    res.json({ success: true, message: "ok" });
});
// 404 JSON
app.use((_, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(Number(PORT), HOST, () => {
    originalLog(`🚀 Server running on http://${HOST}:${PORT}`);
});
//# sourceMappingURL=server.js.map