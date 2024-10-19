const Review = require("../models/Reviews");


const Reviwes = async (req, res) => {
    const { name, email, description, star } = req.body;
    try {
        const newReviwe = new Review({
            name,
            email,
            description,
            star
        })
        await newReviwe.save()
        res.status(201).json({ message: "Review added successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find();
        res.status(200).json(reviews);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { Reviwes , getReviews };



