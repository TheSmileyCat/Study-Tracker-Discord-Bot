import Database from "better-sqlite3";
import { mkdirSync } from 'node:fs';

mkdirSync('data', { recursive: true });

const db = new Database('data/study.db')
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
        id          INTEGER PRIMARY KEY,
        user_id     TEXT NOT NULL,
        guild_id    TEXT NOT NULL,
        subject     TEXT NOT NULL,
        minutes     INTEGER NOT NULL,
        created_at  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_guild_time
        ON sessions (guild_id, created_at);
    
    CREATE TABLE IF NOT EXISTS active_sessions (
        user_id     TEXT PRIMARY KEY,
        guild_id    TEXT NOT NULL,
        subject     TEXT NOT NULL,
        started_at  TEXT NOT NULL
    );
`);

export const getActiveSession = (userId) =>
    db.prepare('SELECT * FROM active_sessions WHERE user_id = ?')
    .get(userId);

export const calculateSessionLength = (sessionStart) => {
    return(Math.max(1, Math.round((Date.now() - sessionStart) / 60000)))
}

export const startSession = (userId, guildId, subject) =>
     db.prepare('INSERT INTO active_sessions (user_id, guild_id, subject, started_at) VALUES (?, ?, ?, ?)')
        .run(userId, guildId, subject.toLowerCase(), Date.now());

export const endSession = db.transaction((userId) => {
    const active = getActiveSession(userId);

    if (!active) return null;

    const minutes = calculateSessionLength(active.started_at)

    db.prepare('INSERT INTO sessions (user_id, guild_id, subject, minutes, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(active.user_id, active.guild_id, active.subject, minutes, active.started_at);

    db.prepare('DELETE FROM active_sessions WHERE user_id = ?').run(userId);

    return { subject: active.subject, minutes: minutes };
});

export default db;