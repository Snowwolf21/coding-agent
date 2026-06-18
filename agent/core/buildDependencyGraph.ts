type DependencyGraph = Record<
  string,
  string[]
>;

export function buildDependencyGraph(
  analyses: any[]
): DependencyGraph {
  const graph: DependencyGraph = {};

  for (const file of analyses) {
    graph[file.path] = file.imports;
  }

  return graph;
}