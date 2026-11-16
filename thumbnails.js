const express = require('express');
const { exec } = require('child_process');

const router = express.Router();

// Resizes a stored avatar to the size the caller asks for.
router.post('/avatars/thumbnail', (req, res) => {
  const { name, size } = req.body;
  exec(`convert avatars/${name} -resize ${size} avatars/thumb-${name}`, (err) => {
    if (err) return res.status(500).json({ error: 'Resize failed' });
    res.status(201).json({ thumbnail: `thumb-${name}` });
  });
});

module.exports = router;
