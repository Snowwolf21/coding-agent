import { getTool } from "./toolRegistry.js";
import { canUseTool } from "./toolPolicy.js";
import { addMetric } from "./toolMetrics.js";

export class ToolManager {
  async execute(toolName: string, args: any) {
    const start = Date.now();

    if (!canUseTool(toolName)) {
      return {
        success: false,
        output: null,
        error: "Tool blocked",
        durationMs: Date.now() - start,
      };
    }

    const tool = getTool(toolName);

    if (!tool) {
      return {
        success: false,
        output: null,
        error: "Tool not found",
        durationMs: Date.now() - start,
      };
    }

    try {
      const output = await tool.execute(args);

      addMetric({
        tool: toolName,
        durationMs: Date.now() - start,
        success: true,
      });

      return {
        success: true,
        output,
        durationMs: Date.now() - start,
      };
    } catch (err: any) {
      addMetric({
        tool: toolName,
        durationMs: Date.now() - start,
        success: false,
      });

      return {
        success: false,
        output: null,
        error: err.message,
        durationMs: Date.now() - start,
      };
    }
  }
}