const Database = require('better-sqlite3');

const db = new Database(process.env.DB_PATH || ':memory:');
db.exec(`CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL
)`);

module.exports = db;
