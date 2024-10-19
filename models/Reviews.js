const mongoose = require('mongoose');

const ReviweSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    description: {
        type: String,
    },
    star: {
        type: Number,
        min: 1,
        max: 5,
    },
    date: {
        type: Date,
        default: Date.now
    },
    time: {
        type: String,
        default: () => new Date().toLocaleTimeString()
    }
})

const Review = mongoose.model('Review', ReviweSchema);

module.exports = Review;