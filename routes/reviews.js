const express = require('express');
const router = express.Router();

// List
router.get('/', (req, res) => {
  res.json({ success: true, data: [] });
});

// Get single
router.get('/:id', (req, res) => {
  res.json({ success: true, data: null });
});

// Create
router.post('/', (req, res) => {
  res.status(201).json({ success: true, message: 'Created successfully' });
});

// Update
router.put('/:id', (req, res) => {
  res.json({ success: true, message: 'Updated successfully' });
});

// Delete
router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Deleted successfully' });
});

module.exports = router;
