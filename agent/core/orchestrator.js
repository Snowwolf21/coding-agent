import parseReview from "./parseReview.js";
import { debuggerAgent } from "../agents/debuggerAgent.js";
import { parseDebugger } from "./parseDebugger.js";
import { runTests } from "../tools/runTests.js";
import { plannerAgent } from "../agents/plannerAgent.js";
import { coderAgent } from "../agents/coderAgent.js";
import { reviewerAgent } from "../agents/reviewerAgent.js";
import { EditSession } from "./editSession.js";
import { gitCommit } from "../tools/git.js";
import { createPRSummary } from "../tools/createPRSummary.js";
import { saveMemory } from "../memory/memoryStore.js";
const MAX_RETRIES = 3;
export async function orchestrate(task) {
    try {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            console.log(`Attempt ${attempt}/${MAX_RETRIES}`);
            // 1. Create a plan
            const plan = await plannerAgent(task);
            // 2. Generate code
            const coderResponse = await coderAgent(task, plan);
            const result = typeof coderResponse === "string"
                ? coderResponse
                : (coderResponse ?? {}).result || "";
            const filePath = (coderResponse ?? {});
            // 3. Apply generated edits
            const session = new EditSession();
            session.add(filePath, result);
            // Uncomment if your EditSession supports it:
            // await session.apply();
            // 4. Run tests
            const testResult = runTests();
            if (!testResult.passed) {
                const fixesText = await debuggerAgent([testResult.output]);
                const testFixes = parseDebugger(fixesText);
                task += `
Fix test failures:
${testFixes.fixes.join("\n")}
`;
                continue;
            }
            // 5. Review generated code
            const reviewText = await reviewerAgent(result);
            const review = parseReview(reviewText);
            if (!review.passed) {
                const fixesText = await debuggerAgent(review.issues);
                const reviewFixes = parseDebugger(fixesText);
                task += `
Apply review fixes:
${reviewFixes.fixes.join("\n")}
`;
                continue;
            }
            // 6. Save memory
            saveMemory(task, result);
            // 7. Generate PR summary
            const summary = session.getSummary();
            const prSummary = await createPRSummary(String(summary));
            // 8. Commit changes
            gitCommit(`AI: ${task.slice(0, 60)}`);
            // 9. Success
            return {
                success: true,
                attempt,
                filePath,
                prSummary,
                result,
            };
        }
        // Retries exhausted
        return {
            success: false,
            error: `Failed after ${MAX_RETRIES} attempts`,
        };
    }
    catch (error) {
        console.error(error);
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : String(error),
        };
    }
}
//# sourceMappingURL=orchestrator.js.map