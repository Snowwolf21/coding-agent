import { llm } from "../llm/index.js";
export async function debuggerAgent(errors) {
    const response = await llm.generate([
        {
            role: "system",
            content: `
Fix these errors.

Return JSON:

{
  "fixes": []
}
`,
        },
        {
            role: "user",
            content: errors.join("\n"),
        },
    ]);
    return response.text;
}
//# sourceMappingURL=debuggerAgent.js.map