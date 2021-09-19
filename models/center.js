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
    address:{
        type: {
            type: String,
            enum: ['Point'],
            required :true
        },
        coordinates: {
            type:[Number],
            required: true
        }
    }
     

}) 

module.exports = mongoose.model("Center", centerSchema);