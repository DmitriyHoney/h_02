"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlogsBody = void 0;
const express_validator_1 = require("express-validator");
const types_1 = require("../types/types");
exports.createBlogsBody = [
    (0, express_validator_1.body)('name')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 15 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('description')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 500 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('websiteUrl')
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isURL().withMessage(types_1.VALIDATION_ERROR_MSG.IS_URL).bail()
        .isLength({ min: 2, max: 100 })
];
