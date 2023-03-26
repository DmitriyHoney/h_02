import {body} from 'express-validator';
import {LikeStatus, VALIDATION_ERROR_MSG} from '../types/types';

export const createCommentsBody = [
    body('content')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 20, max: 300 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
]

export const likeCommentsBody = [
    body('likeStatus')
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
        .custom(async (v, { req }) => {
            const isReqStrValid = [LikeStatus.NONE, LikeStatus.LIKE, LikeStatus.DISLIKE].includes(req.body.likeStatus);
            if (!isReqStrValid) throw new Error(VALIDATION_ERROR_MSG.OUT_OF_RANGE);
            return true;
        }),
]