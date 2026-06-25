import { agent } from "../agent/agent.js";

await agent([
  {
    role: "user",
    content:
      "Run npm test and summarize the result"
  }
]);