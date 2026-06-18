import { runCommand } from "./tools/terminal.js";
import  runAgent  from "../agent/agent.js";
import { agentState} from  "./state.js";

export async function debugLoop(command: string) {
  agentState.debug.lastCommand = command;

  for (let i = 0; i < 3; i++) {
    console.log(`\n🚀 Attempt ${i + 1}`);

    const output = await runCommand(command);

    console.log(output);

    const isError =
      output.includes("ERROR") ||
      output.includes("Exception") ||
      output.includes("Failed");

    if (!isError) {
      console.log("✅ Success");
      return output;
    }

    agentState.debug.lastError = output;
    agentState.debug.attempts++;

    console.log("❌ Error detected → calling AI fix");

    await runAgent(
      `A command failed:${command}

Error:
${output}

Fix the codebase step-by-step and ensure it runs successfully.
      `,
    );
  }

  console.log("❌ Failed after 3 attempts");
}