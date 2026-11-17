const express = require('express');

const router = express.Router();
const avatars = new Map();

// Imports a user's avatar from a URL they give.
router.post('/users/:username/avatar', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });
  const response = await fetch(url);
  avatars.set(req.params.username, Buffer.from(await response.arrayBuffer()));
  res.status(201).json({ message: 'Avatar imported' });
});

module.exports = router;
