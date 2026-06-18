import { llm } from "../llm/index.js";
export async function maintainabilityReviewer(code) {
    const response = await llm.generate([
        {
            role: "system",
            content: `
Review code for maintainability.

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
//# sourceMappingURL=maintainabilityReviewer.js.map