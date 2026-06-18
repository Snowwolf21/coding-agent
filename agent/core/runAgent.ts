import { runLoop } from "./runLoop.js";

export async function runAgent(input: string) {
  return await runLoop(input);
}