const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    title: String,
    text: String,
    date: {type: Date, default: Date.now},
    vaccination_code: Number,
    id_digits: Number,
    rating: Number,
    is_reported: {type: Boolean, default: false},
    upvotes: Number
})

module.exports = mongoose.model("Review", reviewSchema);