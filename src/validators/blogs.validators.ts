import { body, validationResult } from 'express-validator';

export const createProductBody = [
    body('name')
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 3, max: 30 }).withMessage('Min 3 Max 30 symbols'),
    body('description').isLength({ min: 3, max: 1000 }),
    body('websiteUrl').isURL(),
]