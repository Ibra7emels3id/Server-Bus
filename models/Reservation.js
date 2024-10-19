const mongoose = require('mongoose');


const ReservationSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: Number,
    },
    address:{
        type: String,
    },
    busNumber: {
        type: Number,
    },
    from: {
        type: String,
    },
    to: {
        type: String,
    },
    date: {
        type: String,
    },
    inTime:{
        type: String,
    },
    outTime:{
        type: String,
    },
    dateNow:{
        type: Date,
    },
    chair:{
        type: Array,
    },
    totalPrice:{
        type: Number,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    lengthChairs:{
        type: Number,
    },
    NewDate: {
        type: Date,
        default: Date.now
    },
    ProductId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

module.exports = mongoose.model('Reservation', ReservationSchema);