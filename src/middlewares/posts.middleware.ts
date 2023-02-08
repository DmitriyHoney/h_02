import { body, validationResult } from 'express-validator';
import BlogsRepo from '../repositries/blogs.repositry'
export const createPostsBody = [
    body('blogId')
        .trim()
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .custom((value, { req }) => {
            const isExist = BlogsRepo.findById(req.body.blogId);
            if (!isExist) throw new Error(`Blog with blogId=${value} not found`);
            return true;
        }),
    body('blogName')
        .trim()
        .isString().withMessage('Field must be string'),
    body('content')
        .trim()
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 2, max: 1000 }).withMessage('Min 2 Max 30 symbols'),
    body('shortDescription')
        .trim()
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 2, max: 100 }).withMessage('Min 2 Max 100 symbols'),
    body('title')
        .trim()
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 2, max: 30 }).withMessage('Min 2 Max 30 symbols'),
]