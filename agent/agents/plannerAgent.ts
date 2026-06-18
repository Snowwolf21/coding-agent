import { llm } from "../llm/index.js";

export async function plannerAgent(
  task: string
) {
  const response = await llm.generate([
    {
      role: "system",
      content: `
You are a planning agent.

Break the task into steps.

Return JSON:
{
  "steps": []
}
`,
    },
    {
      role: "user",
      content: task,
    },
  ]);

  return response.text;
}