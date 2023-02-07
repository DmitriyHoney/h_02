import { body, validationResult } from 'express-validator';
import PostsRepo from '../repositries/posts.repositry'
export const createPostsBody = [
    body('blogId')
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 1, max: 30 }).withMessage('Min 3 Max 30 symbols')
        .custom((value, { req }) => {
            const isExist = PostsRepo.getByBlogId(req.body.blogId);
            if (!isExist) throw new Error(`Posts with ${value} not found`);
            return true;
        }),
    body('blogName')
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 1, max: 30 }).withMessage('Min 3 Max 30 symbols'),
    body('content')
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 1, max: 30 }).withMessage('Min 3 Max 30 symbols'),
    body('shortDescription')
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 1, max: 30 }).withMessage('Min 3 Max 30 symbols'),
    body('title')
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 1, max: 30 }).withMessage('Min 3 Max 30 symbols'),
]