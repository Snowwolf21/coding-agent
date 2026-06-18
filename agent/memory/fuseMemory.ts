import { searchMemory } from "./memorySearch.js";

export function fuseMemory(task: string) {
  const memories = searchMemory(task);

  if (!memories.length) {
    return "";
  }

  return `
## Relevant Past Work:
${memories
  .map(
    (m: any) =>
      `Task: ${m.task}\nResult: ${m.result}`
  )
  .join("\n\n")}
`;
}