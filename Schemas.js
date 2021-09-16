
const Joi = require('joi');
module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        text:Joi.string().required(),
        //date:Joi.date().format("DD/MM/YYYY").required(),
        vaccination_code:Joi.number().required().min(00000000000000000001).max(99999999999999999999),
        id_digits:Joi.number().required().min(0000).max(9999),
        rating:Joi.number().required()
    }).required()
})