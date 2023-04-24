import {body} from 'express-validator';
import {blogsQueryRepo} from '../repositries/blogs.repositry'
import {LikeStatus, VALIDATION_ERROR_MSG} from '../types/types';

export const createLikeForPostBody = [
    body('likeStatus')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .custom(async (v, { req }) => {
            const isValid = [LikeStatus.LIKE, LikeStatus.DISLIKE, LikeStatus.NONE].includes(req.body.likeStatus);
            if (!isValid) throw new Error(VALIDATION_ERROR_MSG.OUT_OF_RANGE);
            return true;
        }),
]

export const createPostsBody = [
    body('title')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 30 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    body('shortDescription')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 100 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    body('content')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 1000 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    body('blogId')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .custom(async (v, { req }) => {
            const isExist = await blogsQueryRepo.findById(req.body.blogId);
            if (!isExist) throw new Error(VALIDATION_ERROR_MSG.BLOG_ID_NOT_FOUND);
            return true;
        }),
    body('blogName')
        .optional()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail(),
]

export const createPostsBodyWithoutBlogId = [
    body('title')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 30 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    body('shortDescription')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 100 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    body('content')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 2, max: 1000 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    body('blogName')
        .optional()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail(),
]