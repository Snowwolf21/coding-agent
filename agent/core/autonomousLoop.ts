import { runToolLoop } from "./toolLoop.js";

export async function autonomousLoop(
  input: string,
  maxIterations = 5
) {
  let iteration = 0;
  let lastResult = "";

  while (iteration < maxIterations) {
    iteration++;

    console.log(`Iteration ${iteration}`);

    const result = await runToolLoop();

    lastResult = result;

    const isDone =
      !result.includes("tool");

    if (isDone) {
      break;
    }
  }

  return {
    success: true,
    output: lastResult,
    iterations: iteration,
  };
}