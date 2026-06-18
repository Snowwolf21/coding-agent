export function dryRunEdit(original, updated) {
    return {
        preview: true,
        original,
        updated,
        stats: {
            originalLength: original.length,
            updatedLength: updated.length,
            changed: original !== updated,
        },
        timestamp: Date.now(),
    };
}
//# sourceMappingURL=dryRun.js.map