const joi= require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:{
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  }
});

module.exports = mongoose.model("user", userSchema);