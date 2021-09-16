const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
    name: String,
    image: String,
    governrate: String,
    area: String,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    map: String
}) 

module.exports = mongoose.model("Center", centerSchema);