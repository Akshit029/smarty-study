const express = require('express');
const router = express.Router();
const { createSessionLog, getSessionLogs } = require('../controllers/logController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(protect, createSessionLog).get(protect, getSessionLogs);

module.exports = router;
