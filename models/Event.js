const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const eventSchema = new mongoose.Schema({
    event_id: {
        type: String,
        default: uuidv4,
        unique: true,
        index: true
    }, 
    user_id: {
        type: String,
        required: true,
        index: true
    },
    event_type: {
        type: String,
        required: true,
        enum: ['view', 'click', 'location'],
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: false,
    versionKey: false
});

// Compound indexes for better query performance
eventSchema.index({ event_type: 1, timestamp: 1 });
eventSchema.index({ user_id: 1, timestamp: 1 });


module.exports = mongoose.model('Event', eventSchema);