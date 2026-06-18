import { searchMemory } from "./memorySearch.js";
export function fuseMemory(task) {
    const memories = searchMemory(task);
    if (!memories.length) {
        return "";
    }
    return `
## Relevant Past Work:
${memories
        .map((m) => `Task: ${m.task}\nResult: ${m.result}`)
        .join("\n\n")}
`;
}
//# sourceMappingURL=fuseMemory.js.map