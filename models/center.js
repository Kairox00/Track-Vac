const mongoose = require('mongoose')

const centerSchema = new mongoose.Schema({
    name: String,
    image: String,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    map: String
})
module.exports=mongoose.model('center',centerSchema);