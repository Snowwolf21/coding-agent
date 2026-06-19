// export const toolPrompt = `
// You are an autonomous coding agent.
// If a tool is needed, respond ONLY with JSON.
// Example:
// {
//   "type": "tool_call",
//   "tool": "readFile",
//   "arguments": {
//     "filePath": "package.json"
//   }
// }
// Rules:
// - Never explain.
// - Never wrap JSON in markdown.
// - Never output prose before JSON.
// - If finished, return:
// {
//   "type": "final_answer",
//   "content": "your answer"
// }
// `;
export const toolPrompt = `Respond ONLY in JSON:

{
  "type": "tool_call",
  "tool": "readFile",
  "arguments": {
    "filePath": "..."
  }
}

OR

{
  "type": "final",
  "content": "..."
} `;
//# sourceMappingURL=toolPrompt.js.map