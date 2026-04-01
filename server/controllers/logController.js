const SessionLog = require('../models/SessionLog');

// @desc    Create a new study session log
// @route   POST /api/logs
// @access  Private
const createSessionLog = async (req, res) => {
    try {
        const { subject, startTime, endTime, durationMinutes, mood, distractionLevel, energyLevel } = req.body;

        const session = await SessionLog.create({
            user: req.user._id,
            subject,
            startTime,
            endTime,
            durationMinutes,
            mood,
            distractionLevel,
            energyLevel
        });

        res.status(201).json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's study session logs
// @route   GET /api/logs
// @access  Private
const getSessionLogs = async (req, res) => {
    try {
        const logs = await SessionLog.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createSessionLog,
    getSessionLogs,
};
