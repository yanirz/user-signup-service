const db = require('./db');

function listForOwner(ownerId) {
  return db.prepare('SELECT id, title, body FROM notes WHERE owner_id = ?').all(ownerId);
}

function search(ownerId, term) {
  return db
    .prepare('SELECT id, title, body FROM notes WHERE owner_id = ? AND title LIKE ?')
    .all(ownerId, `%${term}%`);
}

function getById(id) {
  return db.prepare('SELECT id, owner_id, title, body FROM notes WHERE id = ?').get(id);
}

function getOwned(id, ownerId) {
  return db.prepare('SELECT id, title, body FROM notes WHERE id = ? AND owner_id = ?').get(id, ownerId);
}

function create(ownerId, { title, body }) {
  const result = db.prepare('INSERT INTO notes (owner_id, title, body) VALUES (?, ?, ?)').run(ownerId, title, body);
  return { id: result.lastInsertRowid, title, body };
}

function remove(id) {
  db.prepare('DELETE FROM notes WHERE id = ?').run(id);
}

module.exports = { listForOwner, search, getById, getOwned, create, remove };
