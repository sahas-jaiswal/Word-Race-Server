const { body } = require('express-validator');
const { validationResult } = require('express-validator');

exports.createUserValidator = [
    body('fullName')
        .exists()
        .withMessage('Your full name is required')
        .notEmpty()
        .withMessage('Full Name is required')
        .isAlpha('en-US', {ignore: ' '})
        .withMessage('Must be only alphabetical chars')
        .isLength({ min: 3 })
        .withMessage('Must be at least 3 chars long'),
    body('email')
        .exists()
        .withMessage('Email is required')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email')
        .normalizeEmail(),
    body('password')
        .exists()
        .withMessage('Password is required')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .isLength({ max: 10 })
        .withMessage('Password can contain max 10 characters'),       
];


exports.validateLogin = [
    body('email')
        .exists()
        .withMessage('Email is required')
        .notEmpty()
        .withMessage('Email must be filled')
        .isEmail()
        .withMessage('Must be a valid email'),
    body('password')
        .exists()
        .withMessage('Password is required')
        .notEmpty()
        .withMessage('Password must be filled')
];


exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);
    if(errors.array().length > 0){
        return res.status(400).json({ error: errors.array()[0].msg })
    }
    next();
}