"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeCommentsBody = exports.createCommentsBody = void 0;
const express_validator_1 = require("express-validator");
const types_1 = require("../types/types");
exports.createCommentsBody = [
    (0, express_validator_1.body)('content')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 20, max: 300 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
];
exports.likeCommentsBody = [
    (0, express_validator_1.body)('likeStatus')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const isReqStrValid = [types_1.LikeStatus.NONE, types_1.LikeStatus.LIKE, types_1.LikeStatus.DISLIKE].includes(req.body.likeStatus);
        if (!isReqStrValid)
            throw new Error(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE);
        return true;
    })),
];
