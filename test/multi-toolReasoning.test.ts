import { agent } from "../agent/agent.js";
await agent([
  {
    role: "user",
    content:
      "Read package.json and tell me the project name and version."
  }
]);