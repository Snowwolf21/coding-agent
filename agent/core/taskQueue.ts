type Task = {
  id: string;
  prompt: string;
};

export class TaskQueue {
  private tasks:
    Task[] = [];

  add(
    task: Task
  ) {
    this.tasks.push(
      task
    );
  }

  next() {
    return this.tasks.shift();
  }
}