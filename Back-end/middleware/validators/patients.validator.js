const { body } = require('express-validator');

exports.createPatientValidator = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),

  body('birth_date')
    .isDate({ format: 'DD-MM-YYYY' })
    .withMessage('Valid birth date is required'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Valid email is required'),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female or Other'),
];

exports.updatePatientValidator = [
  body('full_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty'),

  body('birth_date')
    .optional()
    .isDate({ format: 'DD-MM-YYYY' })
    .withMessage('Valid birth date is required'),

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone cannot be empty')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Valid email is required'),

  body('gender')
    .optional()
    .isIn(['Male', 'Female'])
    .withMessage('Gender must be Male, Female'),
];
