import Database from "better-sqlite3";
import { mkdirSync } from 'node:fs';

mkdirSync('data', { recursive: true });

const db = new Database('data/study.db')
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        user_id         TEXT PRIMARY KEY,
        total_minutes   INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_subjects (
        user_id     TEXT NOT NULL,
        subject     TEXT NOT NULL,
        minutes     INTEGER NOT NULL DEFAULT 0,
        PRIMARY     KEY (user_id, subject)
    );

    CREATE TABLE IF NOT EXISTS guild_users (
        guild_id    TEXT NOT NULL,
        user_id     TEXT NOT NULL,
        minutes     INTEGER NOT NULL DEFAULT 0,
        PRIMARY     KEY (guild_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id        TEXT PRIMARY KEY,
        log_channel_id  TEXT
    );

    CREATE TABLE IF NOT EXISTS active_sessions (
        user_id     TEXT PRIMARY KEY,
        guild_id    TEXT NOT NULL,
        subject     TEXT NOT NULL,
        started_at  INTEGER NOT NULL
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

    db.prepare(`
        INSERT INTO users (user_id, total_minutes) VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET total_minutes = total_minutes + excluded.total_minutes   
    `).run(userId, minutes);

    db.prepare(`
        INSERT INTO user_subjects (user_id, subject, minutes) VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET minutes = minutes + excluded.minutes   
    `).run(userId, active.subject, minutes);
    
    db.prepare(`
        INSERT INTO guild_users (guild_id, user_id, minutes) VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET minutes = minutes + excluded.minutes   
    `).run(active.guild_id, userId, minutes);

    db.prepare('DELETE FROM active_sessions WHERE user_id = ?').run(userId);

    return { subject: active.subject, minutes: minutes, guildId: active.guild_id };
});

export default db;