const tools = new Map();
export function registerTool(tool) {
    tools.set(tool.name, tool);
}
export function getTool(name) {
    return tools.get(name);
}
export function listTools() {
    return Array.from(tools.keys());
}
//# sourceMappingURL=toolRegistry.js.map