const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const AVATAR_DIR = path.join(__dirname, 'avatars');

// Imports a user's avatar from a URL they give.
router.post('/avatars/import', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });
  const response = await fetch(url);
  const body = Buffer.from(await response.arrayBuffer());
  res.status(200).json({ bytes: body.length, type: response.headers.get('content-type') });
});

// Serves a stored avatar by file name.
router.get('/avatars/:name', (req, res) => {
  const file = path.join(AVATAR_DIR, req.query.file || req.params.name);
  fs.readFile(file, (err, data) => {
    if (err) return res.status(404).json({ error: 'Not found' });
    res.type('image/png').send(data);
  });
});

module.exports = router;
