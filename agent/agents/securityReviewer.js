import { llm } from "../llm/index.js";
export async function securityReviewer(code) {
    const response = await llm.generate([
        {
            role: "system",
            content: `
Review code for security issues.

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
//# sourceMappingURL=securityReviewer.js.map