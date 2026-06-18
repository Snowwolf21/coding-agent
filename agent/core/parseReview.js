export default function parseReview(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return {
            passed: false,
            issues: [
                "Invalid review format"
            ],
        };
    }
}
//# sourceMappingURL=parseReview.js.map