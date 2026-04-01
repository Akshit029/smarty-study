const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Profile configuration
    wakeupTime: { type: String, default: '07:00' },
    sleepTime: { type: String, default: '23:00' },
    subjects: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
