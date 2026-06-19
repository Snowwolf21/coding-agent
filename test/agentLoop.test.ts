import { agent } from "../agent/agent.js";

async function run() {
  const result = await agent([
    {
      role: "user",
      content:
        "Read package.json and tell me the project name"
    }
  ]);

  console.log("\n🎉 RESULT:");
  console.log(result);
}

run().catch(console.error);