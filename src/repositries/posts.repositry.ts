import generateBaseRepo from './base.repositry';
import { PostModel, Post } from '../types/types';

const posts: Array<PostModel> = [
    { id: '1', blogId: '17', blogName: 'Blog 1', content: 'dasdasdsd', shortDescription: 'ss', title: 'title 11' },
];

type PostsRepoCustom = {}

export default generateBaseRepo<PostModel, Post, PostsRepoCustom>(posts, {});