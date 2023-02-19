import { body } from 'express-validator';
import { VALIDATION_ERROR_MSG } from '../types/types';

export const authBody = [
    body('loginOrEmail')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail(),
    body('password')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail(),
]