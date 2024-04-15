import Joi from 'joi';

export const userAuthenticationRegister = Joi.object({
    fullName:Joi.string().min(2).max(12).required(),
    userName:Joi.string().min(5).max(12).required(),
    email: Joi.string().min(5).max(50).required().email(),
    password:Joi.string().min(5).max(12).required(),
    passwordConf:Joi.string().min(5).max(12).required(),
})

export const userAuthenticationLogin = Joi.object({
    userName:Joi.string().min(5).max(12).required(),
    password:Joi.string().min(5).max(12).required(),
})