const express = require('express');
const router = express.Router();
const { getPrediction } = require('../controllers/mlController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/predict', protect, getPrediction);

module.exports = router;
