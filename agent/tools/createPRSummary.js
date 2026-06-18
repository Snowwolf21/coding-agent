import { llm } from "../llm/index.js";
export async function createPRSummary(changes) {
    const response = await llm.generate([
        {
            role: "system",
            content: "Write a pull request summary.",
        },
        {
            role: "user",
            content: changes,
        },
    ]);
    return response.text;
}
//# sourceMappingURL=createPRSummary.js.map