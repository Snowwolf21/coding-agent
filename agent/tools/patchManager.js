import fs from "fs";
export function applyPatch(path, content) {
    const old = fs.readFileSync(path, "utf8");
    fs.writeFileSync(path, content);
    return {
        old,
        updated: content,
    };
}
//# sourceMappingURL=patchManager.js.map