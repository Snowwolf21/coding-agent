const blockedTools = new Set([
    "delete_all_files",
]);
export function canUseTool(name) {
    return !blockedTools.has(name);
}
//# sourceMappingURL=toolPolicy.js.map