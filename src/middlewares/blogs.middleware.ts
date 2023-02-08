import { body, validationResult } from 'express-validator';

export const createBlogsBody = [
    body('name')
        .trim()
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 2, max: 15 }).withMessage('Min 2 Max 15 symbols'),
    body('description').trim().isLength({ min: 2, max: 500 }).withMessage('Min 2 Max 500 symbols'),
    body('websiteUrl').trim().isLength({ min: 2, max: 100 }).isURL(),
]