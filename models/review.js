const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    title: String,
    text: String,
    date: Date,
    vaccination_code: Number,
    id_digits: Number,
    rating: Number,
    is_reported: Boolean
})

module.exports = mongoose.model("Review", reviewSchema);