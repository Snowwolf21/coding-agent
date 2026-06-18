type Edit = {
    path: string;
    diff: string;
};
export declare class EditSession {
    edits: Edit[];
    add(path: string, diff: string): void;
    getSummary(): string;
}
export {};
//# sourceMappingURL=editSession.d.ts.map