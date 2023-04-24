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
exports.createPostsBodyWithoutBlogId = exports.createPostsBody = exports.createLikeForPostBody = void 0;
const express_validator_1 = require("express-validator");
const blogs_repositry_1 = require("../repositries/blogs.repositry");
const types_1 = require("../types/types");
exports.createLikeForPostBody = [
    (0, express_validator_1.body)('likeStatus')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const isValid = Object.values(types_1.LikeStatus).includes(req.body.likeStatus);
        if (!isValid)
            throw new Error(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE);
        return true;
    })),
];
exports.createPostsBody = [
    (0, express_validator_1.body)('title')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 30 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('shortDescription')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 100 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('content')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 1000 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('blogId')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const isExist = yield blogs_repositry_1.blogsQueryRepo.findById(req.body.blogId);
        if (!isExist)
            throw new Error(types_1.VALIDATION_ERROR_MSG.BLOG_ID_NOT_FOUND);
        return true;
    })),
    (0, express_validator_1.body)('blogName')
        .optional()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail(),
];
exports.createPostsBodyWithoutBlogId = [
    (0, express_validator_1.body)('title')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 30 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('shortDescription')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 100 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('content')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 1000 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('blogName')
        .optional()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail(),
];
