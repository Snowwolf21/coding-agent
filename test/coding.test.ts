import { agent } from "../agent/agent.js";

async function run() {
  const result = await agent([
    {
      role: "user",
      content:
        "Read package.json and tell me all dependencies."
    }
  ]);

  console.log(result);
}

run();