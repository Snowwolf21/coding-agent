export function analyzeFile(
  path: string,
  content: string
) {
  const imports =
    content.match(
      /import .* from ['"](.*)['"]/g
    ) || [];

  const exports =
    content.match(/export /g) || [];

  return {
    path,
    imports,
    exportsCount: exports.length,
  };
}