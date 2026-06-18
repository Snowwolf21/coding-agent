import fs from "fs";
import os from "os";
import path from "path";
export function createDiffFiles(original, updated) {
    const tempDir = os.tmpdir();
    const oldPath = path.join(tempDir, "old.ts");
    const newPath = path.join(tempDir, "new.ts");
    fs.writeFileSync(oldPath, original);
    fs.writeFileSync(newPath, updated);
    return {
        oldPath,
        newPath,
    };
}
//# sourceMappingURL=createDiffFiles.js.map