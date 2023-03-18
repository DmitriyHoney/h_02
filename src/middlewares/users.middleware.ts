import { body } from 'express-validator';
import { VALIDATION_ERROR_MSG } from '../types/types';
import { isEmail, isLogin } from '../helpers';

export const createUsersBody = [
    body('password')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 6, max: 20 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
]