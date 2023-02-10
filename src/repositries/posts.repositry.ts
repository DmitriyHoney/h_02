import generateBaseRepo from './base.repositry';
import { PostModel, Post } from '../types/types';

type PostsRepoCustom = {}
export default generateBaseRepo<PostModel, Post, PostsRepoCustom>('posts', {});