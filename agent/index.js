import dotenv from "dotenv";
import { agent } from "./agent.js";
import ReadLine from "node:readline";
import { llm } from "./client.js";
import { fileURLToPath } from "node:url";
dotenv.config();
async function main() {
    const response = await llm.generate([
        {
            role: "user",
            content: "What is the meaning of life?"
        }
    ]);
    console.log(response.text);
}
main().catch(console.error);
agent(["What is the meaning of life?"]).catch(console.error);
// ...rest of your readline code...
// ✅ Clean Node.js Native Entrypoint Verification Check
const currentFilePath = fileURLToPath(import.meta.url);
const isCurrentEntryScript = process.argv[1] === currentFilePath;
if (isCurrentEntryScript) {
    const rl = ReadLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    console.log("🤖 Coding Agent Initialized. Type your request below (or type 'exit' to quit):");
    function promptUser() {
        rl.question('\nYou: ', async (userInput) => {
            if (userInput.toLowerCase() === 'exit') {
                rl.close();
                return;
            }
            if (!userInput.trim()) {
                promptUser();
                return;
            }
            try {
                console.log("⏳ Processing request...");
                await agent([userInput]);
            }
            catch (error) {
                console.error("❌ Agent execution error:", error);
            }
            promptUser(); // Loop back for next interaction turn
        });
    }
    promptUser();
}
//# sourceMappingURL=index.js.map