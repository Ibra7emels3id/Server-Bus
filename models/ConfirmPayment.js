const mongoose = require("mongoose");

const ChairSchema = new mongoose.Schema({
    chair: { type: String },
    email: { type: String },
    name: { type: String },
    price: { type: Number },
    chairId: { type: mongoose.Schema.Types.ObjectId },
    status:{
        type: String,
        default: "without",
        enum: ["without", "confirmed", "reservation"],
    }
});

const ConfirmSchema = new mongoose.Schema({
    email: { type: String },
    amount: { type: Number, },
    currency: { type: String, },
    items: { type: [ChairSchema], default: [] },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
    },
    inTime:{
        type: String,
    },
    outTime:{
        type: String,
    },
    date:{
        type: String,
    },
    from:{
        type: String,
    },
    to:{
        type: String,
    },
    name:{
        type: String,
    },
    paymentIntentId:{
        type: String,
    },
    lengthChairs:{
        type: Number,
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    }
});

const Chairs = mongoose.model("Chair", ConfirmSchema);
module.exports = Chairs;
