import fs from "fs";
import { projectCache } from "./projectCache.js";
export function analyzeWorkingTree() {
    const CACHE_TTL = 5 * 60 * 1000;
    if (Date.now() - projectCache.lastUpdated < CACHE_TTL) {
        return projectCache;
    }
    const summary = projectCache.summary;
    const dependencyGraph = projectCache.graph;
    projectCache.lastUpdated = Date.now();
    return projectCache;
}
//# sourceMappingURL=analyzeWorkingTree.js.map