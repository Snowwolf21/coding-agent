import Database from "better-sqlite3";

export interface MemoryRecord {
  id: number;
  task: string;
  result: string;
}

export interface IMemoryRepository {
  saveMemory(task: string, result: string): void;
  getMemories(): MemoryRecord[];
}

class SQLiteMemoryRepository implements IMemoryRepository {
  private db: Database.Database;

  constructor() {
    this.db = new Database("memory.db");
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT,
        result TEXT
      );
    `);
  }

  saveMemory(task: string, result: string): void {
    this.db.prepare(
      `INSERT INTO memories (task, result) VALUES (?, ?)`
    ).run(task, result);
  }

  getMemories(): MemoryRecord[] {
    return this.db.prepare(`SELECT * FROM memories`).all() as MemoryRecord[];
  }
}

export const memoryRepository: IMemoryRepository = new SQLiteMemoryRepository();

export function saveMemory(task: string, result: string) {
  memoryRepository.saveMemory(task, result);
}