import type { FileAnalysis } from "./analyzeWorkingTree.js";

function buildSummary(files: FileAnalysis[]) {
  return files
    .map(
      (f) =>
        `${f.path} → imports:${f.imports.length}, exports:${f.exports}`
    )
    .join("\n");
}