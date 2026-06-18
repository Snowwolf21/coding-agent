import { llm } from "../agent/llm/index.js";

async function run() {
  const res = await llm.generate([
    {
      role: "user",
      content: "Write a TypeScript function that adds two numbers",
    },
  ]);

  console.log(res.text);
}

run();