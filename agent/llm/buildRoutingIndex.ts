import {
  getEmbedding,
} from "./embeddings.js";

import {
  routingProfiles,
} from "./routingProfiles.js";

export const routingIndex: {
  profile: string;
  vector: number[];
  model: string;
}[] = [];

export async function buildRoutingIndex() {
  for (const profile of routingProfiles) {
    const vector =
      await getEmbedding(
        profile.description
      );

    routingIndex.push({
      profile: profile.name,
      vector,
      model: profile.model,
    });
  }

  console.log(
    "Routing index built"
  );
}