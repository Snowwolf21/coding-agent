import fs from "fs";
export function applyEdit(path, patch) {
    const original = fs.readFileSync(path, "utf8");
    const updated = original +
        "\n\n/* AI PATCH START */\n" +
        patch +
        "\n/* AI PATCH END */";
    fs.writeFileSync(path, updated);
    return `Patched ${path}`;
}
//# sourceMappingURL=applyEdit.js.map