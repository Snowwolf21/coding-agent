import { toolRegistry } from "./toolRegistry.js";

export async function handleToolCall(toolCall: any) {
  const args = JSON.parse(toolCall.arguments);

  const tool = toolRegistry[toolCall.name];

  if (!tool) {
    throw new Error(`Unknown tool: ${toolCall.name}`);
  }

  console.log(`🔧 Tool: ${toolCall.name}`);

  const result = await tool(args);

  console.log(`📦 Result:`, result);

  return result;
}