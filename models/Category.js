const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String
    },
    date: {
        type: String,
        default: new Date().toDateString(),
    },
    time: {
        type: String,
        default: new Date().toLocaleTimeString()
    }

});


const Category = mongoose.model('Category', CategorySchema);
module.exports = Category