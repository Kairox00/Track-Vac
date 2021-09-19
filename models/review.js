const joi= require('joi');
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    vaccination_code: Number,
    id_digits: Number,
    governorate: String,
    district: String,
    date: Date,
    vaccination_center:String,
    vaccine:String,
    is_crowded:Boolean,
    is_easy_to_get_vaccinated:Boolean,
    is_easy_to_find:Boolean,
    comment:String,
    rating: Number
})

module.exports = mongoose.model("Review", reviewSchema);