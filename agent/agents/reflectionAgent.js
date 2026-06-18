import { llm } from "../llm/index.js";
export async function reflectionAgent(task, result) {
    const response = await llm.generate([
        {
            role: "system",
            content: `
You are a self-reflection agent.

Analyze the implementation and suggest improvements.

Return JSON:

{
  "improvements": [],
  "risks": []
}
`,
        },
        {
            role: "user",
            content: `
Task:
${task}

Implementation:
${result}
`,
        },
    ]);
    return response.text;
}
//# sourceMappingURL=reflectionAgent.js.map