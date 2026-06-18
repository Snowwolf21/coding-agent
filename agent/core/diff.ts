export function createDiff(
  original: string,
  updated: string
) {
  return `
--- ORIGINAL
${original}

+++ UPDATED
${updated}
`;
}