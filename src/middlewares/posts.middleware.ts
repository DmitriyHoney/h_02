import { body, validationResult } from 'express-validator';
import PostsRepo from '../repositries/posts.repositry'
export const createPostsBody = [
    body('blogId')
        .trim()
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 1, max: 30 }).withMessage('Min 3 Max 30 symbols')
        .custom((value, { req }) => {
            const isExist = PostsRepo.getByBlogId(req.body.blogId);
            if (!isExist) throw new Error(`Posts with ${value} not found`);
            return true;
        }),
    body('blogName')
        .trim()
        .notEmpty().withMessage('Field is required')
        .isString().withMessage('Field must be string')
        .isLength({ min: 1, max: 30 }).withMessage('Min 3 Max 30 symbols'),
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