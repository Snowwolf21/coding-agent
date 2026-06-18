import express from 'express';
import cors from 'cors';
import agent from '../agent/agent.js';
import { acceptEdit } from './core/applyEditActions.js';
import { rejectEdit } from './core/rejectEditAction.js';
const app = express();
app.use(cors());
app.use(express.json());
app.post('/agent', async (req, res) => {
    const { prompt } = req.body;
    try {
        const result = await agent(prompt);
        res.json({ result });
    }
    catch (error) {
        console.error('Error in agent:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post("/chat", async (req, res) => {
    const { prompt } = req.body;
    const result = await agent(prompt);
    res.json({
        response: result,
    });
});
app.post("/accept", (req, res) => {
    try {
        const result = acceptEdit(req.body.id);
        res.json({
            success: true,
            result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.post("/reject", (req, res) => {
    try {
        const result = rejectEdit(req.body.id);
        res.json({
            success: true,
            result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map