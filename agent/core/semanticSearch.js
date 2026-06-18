import Fuse from "fuse.js";
export function semanticSearch(query, files) {
    const fuse = new Fuse(files, {
        keys: ["path", "content"],
        threshold: 0.3,
        includeScore: true,
    });
    return JSON.stringify(fuse.search(query));
}
//# sourceMappingURL=semanticSearch.js.map