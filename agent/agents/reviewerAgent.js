import { llm } from "../llm/index.js";
export async function reviewerAgent(code) {
    const response = await llm.generate([
        {
            role: "system",
            content: `
Review this code.

Return JSON:

{
  "passed": true,
  "issues": []
}
`,
        },
        {
            role: "user",
            content: code,
        },
    ]);
    return response.text;
}
//# sourceMappingURL=reviewerAgent.js.map