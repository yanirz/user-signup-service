const express = require('express');
const path = require('path');

const router = express.Router();

// Downloads one of the service's exported files by name.
router.get('/exports/:name', (req, res) => {
  res.sendFile(path.join(__dirname, 'exports', req.params.name));
});

module.exports = router;
