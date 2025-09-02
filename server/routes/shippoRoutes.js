const express = require('express');
const router = express.Router();
const { getRates, buyLabel } = require('../controllers/shippoController');

// Routes - CORS is handled globally in server/index.js
router.post('/rates', getRates);
router.post('/label', buyLabel);

module.exports = router;
