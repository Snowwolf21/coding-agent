import { agent } from "../agent/agent.js";

const result = await agent([
  {
    role: "user",
    content: "Read package.json and tell me the project name"
  }
]);

console.log(result);