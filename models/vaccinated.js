const mongoose = require('mongoose');

const VaccinatedSchema = new mongoose.Schema({
    vaccination_code: String,
    id_digits: String
})

module.exports = mongoose.model("Vaccinated", VaccinatedSchema);