const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number },
    type: { type: String, enum: ['study', 'break'], default: 'study' }
});

const TimetableSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    tasks: [TaskSchema],
    predictedEfficiencyScore: { type: Number } // 0-100 indicating how well tasks fit peak productivity windows
}, { timestamps: true });

module.exports = mongoose.model('Timetable', TimetableSchema);
