const mongoose = require('mongoose');
const passportLocalMongoose =  require("passport-local-mongoose");

const centerSchema = new mongoose.Schema({
    name: String,
    image: String,
    city: String,
    district: String,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    map: String
})

centerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Center", centerSchema);