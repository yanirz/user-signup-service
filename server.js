const express = require('express');
const crypto = require('crypto');

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

// Look up a user by name from the query string.
app.get('/users/lookup', (req, res) => {
  const user = users.get(req.query.name);
  res.json(user ? { username: user.username, email: user.email, passwordHash: user.passwordHash } : null);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
