"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUsersBody = void 0;
const express_validator_1 = require("express-validator");
const types_1 = require("../types/types");
const helpers_1 = require("../helpers");
exports.createUsersBody = [
    (0, express_validator_1.body)('login')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 3, max: 10 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE).bail()
        .custom((value) => {
        if (!(0, helpers_1.isLogin)(value))
            throw new Error(types_1.VALIDATION_ERROR_MSG.LOGIN_NOT_VALID_TEMPLATE);
        return true;
    }),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 6, max: 20 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .custom((value) => {
        if (!(0, helpers_1.isEmail)(value))
            throw new Error(types_1.VALIDATION_ERROR_MSG.EMAIL_NOT_VALID_TEMPLATE);
        return true;
    }),
];
