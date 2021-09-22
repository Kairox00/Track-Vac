
const Joi = require('joi');
module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        vaccination_code:Joi.number().required().min(10000000000000000000).max(99999999999999999999).unsafe(),
        id_digits:Joi.number().required().min(0000).max(9999),
        vaccine:Joi.any().optional(),
        is_crowded:Joi.boolean().optional(),
        is_easy_to_get_vaccinated:Joi.boolean().optional(),
        is_easy_to_find:Joi.boolean().optional(),
        comment:Joi.any().optional(),
        rating:Joi.number().optional(),
        title: Joi.any().optional(),
        date: Joi.date().timestamp(),
        is_reported: Joi.boolean().optional(),
        upvotes: Joi.any().optional()
    })

})
