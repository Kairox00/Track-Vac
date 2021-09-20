const mongoose = require('mongoose');

const VaccinatedSchema = new mongoose.Schema({
    vaccination_code: Number,
    id_digits: Number
})

module.exports = mongoose.model("Vaccinated", VaccinatedSchema);