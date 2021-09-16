const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
    name: String,
    image: String,
    governorate: String,
    district: String,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    map: String
}) 

module.exports = mongoose.model("Center", centerSchema);