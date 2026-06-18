import fs from "fs";
import path from "path";
import { projectIndex } from "./projectIndex.js";
export function buildIndex(root) {
    projectIndex.files = [];
    function walk(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                walk(fullPath);
            }
            else if (file.endsWith(".ts")) {
                projectIndex.files.push({
                    path: fullPath,
                    content: fs.readFileSync(fullPath, "utf8"),
                });
            }
        }
    }
    walk(root);
}
//# sourceMappingURL=buildIndex.js.map