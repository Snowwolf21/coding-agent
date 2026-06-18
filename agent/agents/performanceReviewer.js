import { llm } from "../llm/index.js";
export async function performanceReviewer(code) {
    const response = await llm.generate([
        {
            role: "system",
            content: `
Review code for performance problems.

Return JSON:
{
  "passed": boolean,
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
//# sourceMappingURL=performanceReviewer.js.map