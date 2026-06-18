import { getEmbedding } from "./embeddings.js";
import { routingIndex } from "./buildRoutingIndex.js";
import { cosineSimilarity } from "./similarity.js";
import { fuseMemory } from "../memory/fuseMemory.js";

export async function semanticRoute(task: string) {
  // 🧠 STEP 1: Inject memory into decision
  const memoryContext = fuseMemory(task);

  const enrichedTask = `
TASK:
${task}

MEMORY:
${memoryContext}
`;

  // STEP 2: Embed enriched context
  const taskVector = await getEmbedding(enrichedTask);

  let bestMatch = null;
  let bestScore = -1;

  for (const item of routingIndex) {
    const score = cosineSimilarity(taskVector, item.vector);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
}