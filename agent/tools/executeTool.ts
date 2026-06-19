import { toolRegistry } from "./toolRegistry.js";

export async function executeTool(
  tool: string,
  args: any
) {
  console.log("\n🛠 TOOL REQUEST");
  console.log("Name:", tool);
  console.log("Args:", args);

  const handler = toolRegistry[tool as keyof typeof toolRegistry];


  if (!handler) {
    const error = `Unknown tool: ${tool}`;

    console.error(error);

    return {
      success: false,
      tool,
      args,
      error
    };
  }

  try {
    const result = await handler(args);

    console.log("✅ TOOL SUCCESS");

    return {
      success: true,
      tool,
      args,
      result
    };
  } catch (error: any) {
    console.error(
      "❌ TOOL FAILED:",
      error?.message
    );

    return {
      success: false,
      tool,
      args,
      error:
        error?.message ??
        "Unknown tool error"
    };
  }
}