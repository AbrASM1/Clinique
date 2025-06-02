const { body } = require('express-validator');

const validStatuses = ['unscheduled', 'scheduled', 'completed', 'cancelled'];

exports.validateAppointmentCreation = [
  body('patient_id')
    .notEmpty().withMessage('Patient ID is required')
    .isInt({ min: 1 }).withMessage('Patient ID must be a positive integer'),

  body('doctor_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Doctor ID must be a positive integer'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),

  body('date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Date must be in YYYY-MM-DD format'),

  body('start_time')
    .optional({ checkFalsy: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:MM (24-hour) format'),

  body('end_time')
    .optional({ checkFalsy: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:MM (24-hour) format'),
];

exports.validateAppointmentUpdate = [
  body('doctor_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Doctor ID must be a positive integer'),

  body('status')
    .optional({ checkFalsy: true })
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),

  body('date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Date must be in YYYY-MM-DD format'),

  body('start_time')
    .optional({ checkFalsy: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:MM (24-hour) format'),

  body('end_time')
    .optional({ checkFalsy: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:MM (24-hour) format'),
];

exports.validateStatusUpdate = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
];
