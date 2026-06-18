import Database from "better-sqlite3";
const db = new Database("memory.db");
export function searchMemory(query) {
    return db
        .prepare(`
    SELECT * FROM memories
    WHERE task LIKE ?
    LIMIT 5
  `)
        .all(`%${query}%`);
}
//# sourceMappingURL=memorySearch.js.map