import path from "path";
export function validateFilePath(filePath) {
    // Normalize path for safety
    const normalized = path.normalize(filePath);
    // Block dangerous paths
    const blockedPaths = [
        "node_modules",
        ".git",
        ".env",
    ];
    for (const blocked of blockedPaths) {
        if (normalized.includes(blocked)) {
            throw new Error(`Blocked access to ${blocked}`);
        }
    }
    return true;
}
export function validateEditContent(original, updated) {
    if (!updated.trim()) {
        throw new Error("Updated content cannot be empty");
    }
    return true;
}
//# sourceMappingURL=safety.js.map