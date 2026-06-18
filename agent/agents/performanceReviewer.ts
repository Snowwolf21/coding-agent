import { llm } from "../llm/index.js";

export async function performanceReviewer(
  code: string
) {
  const response =
    await llm.generate([
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