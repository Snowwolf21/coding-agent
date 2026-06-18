export class EditSession {
    edits = [];
    add(path, diff) {
        this.edits.push({
            path,
            diff,
        });
    }
    getSummary() {
        return this.edits
            .map((e) => `${e.path}\n${e.diff}`)
            .join("\n\n");
    }
}
//# sourceMappingURL=editSession.js.map