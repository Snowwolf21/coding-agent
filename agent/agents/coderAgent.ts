import { runLoop } from "../core/runLoop.js";

export async function coderAgent(
  task: string,
  plan: string
) {
  const prompt = `
Task:
${task}

Plan:
${plan}

Implement the task using tools.
`;

  return await runLoop(prompt);
}