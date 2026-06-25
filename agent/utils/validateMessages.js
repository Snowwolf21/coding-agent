export function validateMessages(messages) {
    if (!Array.isArray(messages)) {
        return {
            ok: false,
            error: "Messages must be an array",
            index: -1
        };
    }
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (!msg || typeof msg !== "object") {
            return {
                ok: false,
                error: "Message is not an object",
                index: i,
                value: msg
            };
        }
        if (typeof msg.role !== "string") {
            return {
                ok: false,
                error: "Invalid role",
                index: i,
                value: msg
            };
        }
        if (typeof msg.content !== "string") {
            return {
                ok: false,
                error: "Invalid content (must be string)",
                index: i,
                value: msg
            };
        }
    }
    return { ok: true };
}
//# sourceMappingURL=validateMessages.js.map