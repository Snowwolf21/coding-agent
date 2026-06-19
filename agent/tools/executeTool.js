import { toolRegistry } from "./toolRegistry.js";
export async function executeTool(tool, args) {
    console.log("Requested Tool:", tool);
    console.log("Arguments:", args);
    console.log("Available Tools:", Object.keys(toolRegistry));
    const handler = toolRegistry[tool];
    if (!handler) {
        throw new Error(`Unknown tool: ${tool}`);
    }
    const result = await handler(args);
    console.log("Tool Result:", result);
    return result;
}
//# sourceMappingURL=executeTool.js.map