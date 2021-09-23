
const Joi = require('joi');
module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        vaccination_code:Joi.string(),
        id_digits:Joi.string,
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
