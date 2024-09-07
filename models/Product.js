const mongoose  = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        // min: 0
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    date:{
        type: String,
        default: new Date().toDateString(),
    },
    time:{
        type: String,
        default: new Date().toLocaleTimeString(),
    },
    quantity: {
        type: Number,
    }

})

const Product = mongoose.model('Product', ProductSchema )

module.exports = Product;