import "../agent/core/toolManager/registerTools.js";
import { ToolManager } from "../agent/core/toolManager/toolManager.js";

async function run() {
  const manager = new ToolManager();

  console.log(
    await manager.execute(
      "read_file",
      { path: "package.json" }
    )
  );
}

run();