const mongoose = require('mongoose');
require('dotenv').config();
const url = process.env.MONGODB_URL

// Connect to MongoDB
const connectDB = () => {
    try {
        mongoose.connect(url)
            .then(() => console.log('MongoDB Connected...'))
            .catch(err => console.error(err));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }   
}

module.exports = connectDB;