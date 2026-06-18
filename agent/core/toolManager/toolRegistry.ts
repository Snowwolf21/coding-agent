import type { Tool } from "../toolManager/types.js";

const tools = new Map<string, Tool>();

export function registerTool(
  tool: Tool
) {
  tools.set(tool.name, tool);
}

export function getTool(
  name: string
) {
  return tools.get(name);
}

export function listTools() {
  return Array.from(
    tools.keys()
  );
}