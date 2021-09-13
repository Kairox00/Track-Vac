const mongoose = require("mongoose");
const passportLocalMongoose =  require("passport-local-mongoose");

const modSchema = new mongoose.Schema({
    username: String,
    password: String
})

modSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Mod", modSchema);
