import { llm } from "../agent/llm/index.js";
async function run() {
    const response = await llm.generate([
        {
            role: "user",
            content: "Read package.json using the readFile tool. Respond only with JSON."
        }
    ]);
    console.log(response.text);
}
run().catch(console.error);
//# sourceMappingURL=toolcall.test.js.map