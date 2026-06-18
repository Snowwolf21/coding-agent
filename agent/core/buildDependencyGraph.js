export function buildDependencyGraph(analyses) {
    const graph = {};
    for (const file of analyses) {
        graph[file.path] = file.imports;
    }
    return graph;
}
//# sourceMappingURL=buildDependencyGraph.js.map