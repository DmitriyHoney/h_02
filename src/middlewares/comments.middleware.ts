import { body } from 'express-validator';
import { VALIDATION_ERROR_MSG } from '../types/types';

export const createCommentsBody = [
    body('content')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 20, max: 300 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
]