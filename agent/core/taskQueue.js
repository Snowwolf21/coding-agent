export class TaskQueue {
    tasks = [];
    add(task) {
        this.tasks.push(task);
    }
    next() {
        return this.tasks.shift();
    }
}
//# sourceMappingURL=taskQueue.js.map