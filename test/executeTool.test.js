import { executeTool } from "../agent/tools/executeTool.js";
async function run() {
    const result = await executeTool("readFile", {
        filePath: "package.json"
    });
    console.log(result);
}
run().catch(console.error);
//# sourceMappingURL=executeTool.test.js.map