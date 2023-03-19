import { body } from 'express-validator';
import { VALIDATION_ERROR_MSG } from '../types/types';
import { isEmail, isLogin } from '../helpers';

export const createUsersBody = [
    body('login')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 3, max: 10 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE).bail()
        .custom((value) => {
            if (!isLogin(value)) throw new Error(VALIDATION_ERROR_MSG.LOGIN_NOT_VALID_TEMPLATE);
            return true;
        }),
    body('password')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 6, max: 20 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    body('email')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .custom((value) => {
            if (!isEmail(value)) throw new Error(VALIDATION_ERROR_MSG.EMAIL_NOT_VALID_TEMPLATE);
            return true;
        }),
]