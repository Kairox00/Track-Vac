const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    text: String,
    date: Date,
    vaccination_code: Number,
    id_digits: Number,
    rating: Number
})

module.exports = mongoose.model("Review", reviewSchema);