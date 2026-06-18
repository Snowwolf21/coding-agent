type Task = {
    id: string;
    prompt: string;
};
export declare class TaskQueue {
    private tasks;
    add(task: Task): void;
    next(): Task | undefined;
}
export {};
//# sourceMappingURL=taskQueue.d.ts.map