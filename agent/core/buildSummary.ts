export function buildSummary(
  analyses: any[]
) {
  return analyses
    .map(
      (file) =>
        `${file.path}: imports=${file.imports.length}`
    )
    .join("\n");
}