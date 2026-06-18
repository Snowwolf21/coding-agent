import { execSync, } from "child_process";
export function gitStatus() {
    return execSync("git status --short", {
        encoding: "utf8",
    });
}
export function gitCommit(message) {
    execSync("git add .");
    execSync(`git commit -m "${message}"`, {
        stdio: "pipe",
    });
    return "Commit created";
}
//# sourceMappingURL=git.js.map