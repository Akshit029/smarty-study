const Timetable = require('../models/Timetable');
const axios = require('axios');

// @desc    Generate a new timetable
// @route   POST /api/timetables/generate
// @access  Private
const generateTimetable = async (req, res) => {
    try {
        const { date, tasksToSchedule } = req.body; // array of { title, subject, targetDuration }
        
        let scheduledTasks = [];
        let currentTime = new Date(date);
        currentTime.setHours(req.user.wakeupTime ? parseInt(req.user.wakeupTime.split(':')[0]) : 8, 0, 0, 0);

        // Greedy algorithm: Sort tasks descending by duration
        const sortedTasks = tasksToSchedule.sort((a, b) => b.targetDuration - a.targetDuration);

        let sumFocusScores = 0;

        for (let task of sortedTasks) {
            const currentHour = currentTime.getHours();
            let focusScore = 75; // fallback baseline
            
            try {
                const mlRes = await axios.post('http://127.0.0.1:5001/predict', {
                    time_of_day: currentHour,
                    duration_minutes: task.targetDuration,
                    mood: 7, 
                    distraction_level: 3 // Assumed baseline inputs for schedule forecasting
                });
                focusScore = mlRes.data.predicted_efficiency_score || focusScore;
            } catch (mlErr) {
                console.warn('ML prediction skipped or failed, using fallback score');
            }
            sumFocusScores += focusScore;

            const taskEndTime = new Date(currentTime.getTime() + task.targetDuration * 60000);
            
            scheduledTasks.push({
                title: task.title,
                subject: task.subject,
                startTime: new Date(currentTime),
                endTime: taskEndTime,
                durationMinutes: task.targetDuration,
                type: 'study'
            });

            // Advance time and insert mandatory 15-minute break
            currentTime = new Date(taskEndTime.getTime() + 15 * 60000);
            scheduledTasks.push({
                title: 'Break',
                subject: 'Rest',
                startTime: taskEndTime,
                endTime: new Date(currentTime),
                durationMinutes: 15,
                type: 'break'
            });
        }

        const efficiencyScore = scheduledTasks.length > 0 ? (sumFocusScores / sortedTasks.length) : 0;

        const timetable = await Timetable.create({
            user: req.user._id,
            date: new Date(date),
            tasks: scheduledTasks,
            predictedEfficiencyScore: efficiencyScore
        });

        res.status(201).json(timetable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating timetable' });
    }
};

// @desc    Get user timetables
// @route   GET /api/timetables
// @access  Private
const getTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find({ user: req.user._id }).sort({ date: -1 });
        res.json(timetables);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    generateTimetable,
    getTimetables
};
