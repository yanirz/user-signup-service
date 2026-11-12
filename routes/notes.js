const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const notes = require('../lib/notes');

const router = express.Router();

router.use(requireAuth);

router.get('/notes', (req, res) => {
  res.json(notes.listForOwner(req.user.id));
});

router.post('/notes', (req, res) => {
  const { title, body } = req.body;
  if (typeof title !== 'string' || typeof body !== 'string') {
    return res.status(400).json({ error: 'title and body are required' });
  }
  res.status(201).json(notes.create(req.user.id, { title, body }));
});

router.delete('/notes/:id', (req, res) => {
  const note = notes.getOwned(req.params.id, req.user.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  notes.remove(note.id);
  res.status(204).end();
});

module.exports = router;
