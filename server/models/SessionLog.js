const mongoose = require('mongoose');

const SessionLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    mood: { type: Number, min: 1, max: 10, required: true }, // 1-10 scale
    distractionLevel: { type: Number, min: 1, max: 10, required: true }, // 1-10 scale
    energyLevel: { type: Number, min: 1, max: 10 }, // Optional
}, { timestamps: true });

module.exports = mongoose.model('SessionLog', SessionLogSchema);
