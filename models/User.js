const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    image: {
        type: String,
        default: 'default_user.jpg'
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;