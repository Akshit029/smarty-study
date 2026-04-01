const express = require('express');
const router = express.Router();
const { generateTimetable, getTimetables } = require('../controllers/timetableController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/generate', protect, generateTimetable);
router.get('/', protect, getTimetables);

module.exports = router;
