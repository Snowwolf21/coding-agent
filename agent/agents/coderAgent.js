import { runLoop } from "../core/runLoop.js";
export async function coderAgent(task, plan, history = []) {
    const prompt = `
Task:
${task}

Plan:
${plan}

Implement the task using tools.
`;
    return await runLoop(prompt, history);
}
//# sourceMappingURL=coderAgent.js.map