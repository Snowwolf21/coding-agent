import Fuse from "fuse.js";
import { projectIndex, } from "./projectIndex.js";
export function retrieveContext(query) {
    const fuse = new Fuse(projectIndex.files, {
        keys: [
            "path",
            "content",
        ],
        threshold: 0.3,
    });
    return fuse
        .search(query)
        .slice(0, 5);
}
//# sourceMappingURL=retrieveContext.js.map