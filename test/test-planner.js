import { plannerAgent } from "../agent/agents/plannerAgent.js";
async function run() {
    const plan = await plannerAgent("Build JWT auth");
    console.log(plan);
}
run();
//# sourceMappingURL=test-planner.js.map