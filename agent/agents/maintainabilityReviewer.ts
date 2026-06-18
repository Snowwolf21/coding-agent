import { llm } from "../llm/index.js";

export async function maintainabilityReviewer(
  code: string
) {
  const response =
    await llm.generate([
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