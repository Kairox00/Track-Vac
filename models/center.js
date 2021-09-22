const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
    name: String,
    image: {
            type: String,
            default: 'https://res.cloudinary.com/kairox/image/upload/v1632138189/posiw4j4xnaxti6gfwjd.jpg'
        },
    governorate: String,
    district: String,
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