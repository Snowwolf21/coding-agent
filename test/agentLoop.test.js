import { agent } from "../agent/agent.js";
async function run() {
    await agent(["Read package.json and tell me the project name"]);
}
run().catch(console.error);
//# sourceMappingURL=agentLoop.test.js.map