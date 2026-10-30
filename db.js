import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'tickets.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    requester_email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export function getAllTickets() {
  return db.prepare(`
    SELECT *
    FROM tickets
    ORDER BY created_at DESC
  `).all();
}

export function getTicketById(id) {
  return db.prepare(`
    SELECT *
    FROM tickets
    WHERE id = ?
  `).get(id);
}

export function createTicket({ title, description, priority, requester_email }) {
  const result = db.prepare(`
    INSERT INTO tickets (title, description, priority, requester_email, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(title, description, priority, requester_email);

  return getTicketById(result.lastInsertRowid);
}

export function updateTicket(id, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    return getTicketById(id);
  }

  values.push(id);

  db.prepare(`
    UPDATE tickets
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(...values);

  return getTicketById(id);
}

export function deleteTicket(id) {
  const result = db.prepare(`
    DELETE FROM tickets
    WHERE id = ?
  `).run(id);

  return result.changes > 0;
}
