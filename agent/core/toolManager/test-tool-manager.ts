import "./registerTools.js";

import { ToolManager } from "./toolManager.js";


async function main() {
  const manager =
    new ToolManager();

  const result =
  await manager.execute(
    "write_file",
    {
      path: "hello.txt",
      content:
        "Hello AI",
    }
  );

  console.log(
    result
  );
}

main();