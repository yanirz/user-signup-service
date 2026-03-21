const express = require('express');
const crypto = require('crypto');
const { execSync } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

// In-memory user store
const users = new Map();

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required' });
  }

  if (users.has(username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');

  users.set(username, { username, email, passwordHash: `${salt}:${hash}`, createdAt: new Date().toISOString() });

  res.status(201).json({ message: 'User created', username, email });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = users.get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const [salt, storedHash] = user.passwordHash.split(':');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');

  if (hash !== storedHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful', username: user.username, email: user.email });
});

app.get('/users', (req, res) => {
  const list = [...users.values()].map(({ username, email, createdAt }) => ({ username, email, createdAt }));
  res.json(list);
});

// In-memory notes store
const notes = new Map();

// Add a note for a user
app.post('/users/:username/notes', (req, res) => {
  const { username } = req.params;
  const { title, content } = req.body;

  if (!users.has(username)) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const userNotes = notes.get(username) || [];
  const note = { id: userNotes.length + 1, title, content, createdAt: new Date().toISOString() };
  userNotes.push(note);
  notes.set(username, userNotes);

  res.status(201).json(note);
});

// Get all notes for a user
app.get('/users/:username/notes', (req, res) => {
  const { username } = req.params;
  const userNotes = notes.get(username) || [];
  res.json(userNotes);
});

// Export user notes to a file in the requested format
app.get('/users/:username/notes/export', (req, res) => {
  const { username } = req.params;
  const format = req.query.format || 'json';

  const userNotes = notes.get(username) || [];
  const tmpFile = path.join('/tmp', `${username}_notes.json`);

  require('fs').writeFileSync(tmpFile, JSON.stringify(userNotes, null, 2));

  // Convert to requested format using system tools
  if (format !== 'json') {
    try {
      const output = execSync(`cat ${tmpFile} | head -c 10000 && echo "Format: ${format}"`);
      res.type('text/plain').send(output.toString());
    } catch (err) {
      res.status(500).json({ error: 'Export failed' });
    }
  } else {
    res.json(userNotes);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
