export function createDiff(original, updated) {
    return `
--- ORIGINAL
${original}

+++ UPDATED
${updated}
`;
}
//# sourceMappingURL=diff.js.map