import { agent } from "../agent/agent.js";

await agent([
  {
    role: "user",
    content:
      "Create a file hello.txt containing Hello World"
  }
]);