const express = require('express');
const router = express.Router();

// Test route for resume API
router.get('/test', (req, res) => {
  res.json({ message: 'Resume route is working' });
});

module.exports = router;
