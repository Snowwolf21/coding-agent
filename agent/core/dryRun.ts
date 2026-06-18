export function dryRunEdit(
  original: string,
  updated: string
) {
  return {
    preview: true,
    original,
    updated,
    stats: {
      originalLength: original.length,
      updatedLength: updated.length,
      changed:
        original !== updated,
    },
    timestamp: Date.now(),
  };
}