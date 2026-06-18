import Database
from "better-sqlite3";

const db =
  new Database(
    "memory.db"
  );

db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  task TEXT,
  result TEXT
)
`);

export function saveTask(
  task: string,
  result: string
) {
  db.prepare(`
INSERT INTO tasks
(task, result)
VALUES (?, ?)
`).run(
    task,
    result
  );
}


export function getMemory(
  query: string
) {
  return db
    .prepare(`
SELECT *
FROM tasks
WHERE task LIKE ?
LIMIT 5
`)
    .all(
      `%${query}%`
    );
}


