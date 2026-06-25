import fs from "fs";
import { agentState } from "../state.js";
export default function writeFile({ path, content }) {
    const backupPath = path + ".backup";
    const original = fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
    // backup first
    if (fs.existsSync(path)) {
        fs.copyFileSync(path, backupPath);
    }
    fs.writeFileSync(path, content);
    const id = Date.now() + Math.floor(Math.random() * 1000);
    agentState.project.suggestions.push({
        id,
        path,
        original,
        updated: content,
        diff: "",
        preview: true
    });
    return `Updated ${path} (backup created, staged suggestion ID: ${id})`;
}
//# sourceMappingURL=writeFile.js.map