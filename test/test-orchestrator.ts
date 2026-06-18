import { orchestrate }
from "../agent/core/orchestrator.js";

async function run() {
  const result =
    await orchestrate(
      "Create add.ts with add function"
    );

  console.log(result);
}

run();