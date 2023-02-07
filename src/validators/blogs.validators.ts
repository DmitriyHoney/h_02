import { body, validationResult } from 'express-validator';

export const createProductBody = [
    body('name').isLength({ min: 3, max: 30 }),
    body('description').isLength({ min: 3, max: 1000 }),
    body('websiteUrl').isURL(),
]