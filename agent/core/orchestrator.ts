import { promises as fs } from "fs";
import { debuggerAgent } from "../agents/debuggerAgent.js";
import { runTests } from "../tools/runTests.js";
import { plannerAgent } from "../agents/plannerAgent.js";
import { coderAgent } from "../agents/coderAgent.js";
import { reviewerAgent } from "../agents/reviewerAgent.js";
import { EditSession } from "./editSession.js";
import { gitCommit } from "../tools/git.js";
import { createPRSummary } from "../tools/createPRSummary.js";
import { saveMemory } from "../memory/memoryStore.js";
import { parseLLMJson } from "../utils/jsonParser.js";
import { logger } from "../utils/logger.js";

const MAX_RETRIES = 3;

interface OrchestrateResult {
  success: boolean;
  attempt?: number;
  filePath?: string;
  prSummary?: string;
  result?: string;
  error?: string;
}

/**
 * Parses the debugger agent output which is expected to return structured JSON
 * containing the fixes array. Falls back to manual extraction if model errs.
 */
function parseDebugger(text: string): { fixes: string[] } {
  try {
    const data = parseLLMJson(text);
    if (data && Array.isArray(data.fixes)) {
      return { fixes: data.fixes };
    }
    return { fixes: [text] };
  } catch {
    return { fixes: [text] };
  }
}

/**
 * Parses the reviewer agent output which is expected to return structured JSON
 * containing passed status and issues.
 */
function parseReview(text: string): { passed: boolean; issues: string[] } {
  try {
    const data = parseLLMJson(text);
    return {
      passed: typeof data.passed === "boolean" ? data.passed : false,
      issues: Array.isArray(data.issues) ? data.issues : []
    };
  } catch {
    // If it fails to parse JSON, look for common markers
    const passed = text.toLowerCase().includes('"passed": true') || text.toLowerCase().includes("passed: true");
    return {
      passed,
      issues: passed ? [] : [text]
    };
  }
}

/**
 * Coordinates planning, coding, applying edits, running tests, checking quality metrics,
 * saving memory context, summarizing work, and committing modifications to the repository.
 */
export async function orchestrate(task: string, history: any[] = []): Promise<OrchestrateResult> {
  let activeTask = task;

  try {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`\n🔄 Orchestration Loop: Attempt ${attempt}/${MAX_RETRIES}`);

      // 1. Create a conceptual action plan
      console.log("📝 Generating implementation plan...");
      const plan = await plannerAgent(activeTask);

      // 2. Generate code edits based on the plan
      console.log("💻 Coding agent generating implementation...");
      const coderResponse = await coderAgent(activeTask, plan, history);

      const result =
        typeof coderResponse === "string"
          ? coderResponse
          : (coderResponse ?? {} as any).result || "";

      // Safely extract filePath with a robust fallback
      const filePath = 
        typeof coderResponse === "object" && coderResponse !== null
          ? (coderResponse as any).filePath || "agent/index.ts"
          : "agent/index.ts";

      // 3. Apply generated edits
      logger.info(`💾 Applying changes to: ${filePath}`);
      const session = new EditSession();
      session.add(filePath, result);

      // Direct, robust file writing to guarantee changes are applied before running tests
      await fs.writeFile(filePath, result, "utf8");

      // 4. Run suite tests
      logger.info("🧪 Running validation test suites...");
      const testResult = await runTests();

      if (!testResult.passed) {
        logger.warn("⚠️ Test failures detected. Initiating debugger agent...");
        const fixesText = await debuggerAgent([testResult.output]);
        const testFixes = parseDebugger(fixesText);

        // Update task instructions for next loop iteration
        activeTask = `${task}\n\n[System Correction: Fix the following test failures from the previous attempt]\n${testFixes.fixes.join("\n")}`;
        continue;
      }

      // 5. Review generated code quality
      logger.info("🔍 Reviewing code quality metrics...");
      const reviewText = await reviewerAgent(result);
      const review = parseReview(reviewText);

      if (!review.passed) {
        logger.warn("⚠️ Code review rejected implementation issues. Triggering fixes...");
        const fixesText = await debuggerAgent(review.issues);
        const reviewFixes = parseDebugger(fixesText);

        // Update task instructions for next loop iteration
        activeTask = `${task}\n\n[System Correction: Apply requested review feedback corrections]\n${reviewFixes.fixes.join("\n")}`;
        continue;
      }

      // 6. Save memories on successful implementations
      logger.info("🧠 Storing experience parameters into memory context...");
      await saveMemory(activeTask, result);

      // 7. Generate concise Pull Request summary logs
      logger.info("📄 Drafting PR metadata summarizations...");
      const summary = await session.getSummary();
      const prSummary = await createPRSummary(String(summary));

      // 8. Commit stable state to repository history
      logger.info("🚀 Committing finalized edits to repository branch...");
      await gitCommit(`AI: ${task.slice(0, 60)}`);

      // 9. Successfully completed
      console.log("🏆 Tasks completed successfully!");
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
      error: `Failed after maximum of ${MAX_RETRIES} attempts. Corrective cycles could not yield passing states.`,
    };
  } catch (error) {
    console.error("💥 Orchestration runner encountered a fatal exception:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}