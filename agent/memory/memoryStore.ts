import Database from "better-sqlite3";

const db = new Database("memory.db");

db.exec(`
CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task TEXT,
  result TEXT
);
`);

export function saveMemory(
  task: string,
  result: string
) {
  db.prepare(
    `INSERT INTO memories (task, result) VALUES (?, ?)`
  ).run(task, result);
}