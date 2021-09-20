const joi= require('joi');
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    vaccination_code: String,
    id_digits: String,
    governorate: String,
    district: String,
    vaccination_center:String,
    vaccine:String,
    is_crowded:Boolean,
    is_easy_to_get_vaccinated:Boolean,
    is_easy_to_find:Boolean,
    comment:String,
    rating: Number,
    title: String,
    date: {type: Date, default: Date.now},
    is_reported: {type: Boolean, default: false},
    upvotes: Number
})

module.exports = mongoose.model("Review", reviewSchema);