export function aggregateDebate(reviews) {
    const issues = reviews.flatMap(r => r.issues);
    return {
        passed: issues.length === 0,
        issues,
    };
}
//# sourceMappingURL=debate.js.map