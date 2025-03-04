import { getDb } from "./database.mjs";
import { StatementSync } from "node:sqlite";

function Antilink(): void {
     const db = getDb();
     db.exec(`CREATE TABLE IF NOT EXISTS antilink (
        id TEXT PRIMARY KEY,
        mode TEXT CHECK(mode IN ('kick', 'delete') OR mode IS NULL),
        status INTEGER NOT NULL DEFAULT 0
    )`);
}

function Antiword(): void {
     const db = getDb();
     db.exec(`
        CREATE TABLE IF NOT EXISTS antiword (
            id TEXT PRIMARY KEY,
            status INTEGER CHECK (status IN (0, 1)),
            words TEXT
        )
    `);
}

export function setAntilink(id: string, status: boolean, mode?: "kick" | "delete"): boolean {
     Antilink();
     const db = getDb();
     const stmt: StatementSync = db.prepare(`INSERT OR REPLACE INTO antilink (id, mode, status) VALUES (?, ?, ?)`);
     stmt.run(id, mode ?? null, status ? 1 : 0);
     return true;
}

export function getAntilink(id: string): { mode: "kick" | "delete" | null; status: boolean } | null {
     Antilink();
     const db = getDb();
     const stmt: StatementSync = db.prepare(`SELECT mode, status FROM antilink WHERE id = ?`);
     const result = stmt.get(id) as { mode: "kick" | "delete" | null; status: number } | undefined;
     return result ? { mode: result.mode, status: !!result.status } : null;
}

export function delAntilink(id: string): boolean {
     Antilink();
     const db = getDb();
     const stmt: StatementSync = db.prepare(`DELETE FROM antilink WHERE id = ?`);
     const result = stmt.run(id);
     return (result.changes ?? 0) > 0;
}

export function setAntiword(id: string, status: number, words: string[]): { success: boolean; added: number } {
     Antiword();
     const db = getDb();
     const stmtGet: StatementSync = db.prepare("SELECT words FROM antiword WHERE id = ?");
     const existing = stmtGet.get(id) as { words: string } | undefined;
     const existingWords = existing?.words ? JSON.parse(existing.words) : [];
     const uniqueWords = [...new Set([...existingWords, ...words])];
     const added = uniqueWords.length - existingWords.length;

     const stmtRun: StatementSync = db.prepare("INSERT OR REPLACE INTO antiword (id, status, words) VALUES (?, ?, ?)");
     stmtRun.run(id, status, JSON.stringify(uniqueWords));

     return { success: true, added };
}

export function delAntiword(id: string): boolean {
     Antiword();
     const db = getDb();
     const stmt: StatementSync = db.prepare("DELETE FROM antiword WHERE id = ?");
     const result = stmt.run(id);
     return (result.changes ?? 0) > 0;
}

export function getAntiword(id: string): { status: boolean; words: string[] } | null {
     Antiword();
     const db = getDb();
     const stmt: StatementSync = db.prepare("SELECT status, words FROM antiword WHERE id = ?");
     const result = stmt.get(id) as { status: number; words: string } | undefined;
     if (!result) return null;
     return { status: Boolean(result.status), words: JSON.parse(result.words) };
}
