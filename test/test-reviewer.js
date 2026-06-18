import { reviewerAgent } from "../agent/agents/reviewerAgent.js";
async function run() {
    const review = await reviewerAgent(`
      function add(a,b){
        return a+b
      }
    `);
    console.log(review);
}
run();
//# sourceMappingURL=test-reviewer.js.map