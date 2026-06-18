import { coderAgent } from "../agent/agents/coderAgent.js";
async function run() {
    const result = await coderAgent("Create add function", "Write add.ts");
    console.log(result);
}
run();
//# sourceMappingURL=test-coder.js.map