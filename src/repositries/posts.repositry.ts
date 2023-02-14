import { generateBaseCommandRepo, generateBaseQueryRepo } from './base.repositry';
import { PostModel, Post } from '../types/types';

type PostsCommandRepoCustom = {}
export const postCommandRepo = generateBaseCommandRepo<PostModel, Post, PostsCommandRepoCustom>('posts', {});

type PostsQueryRepoCustom = {}
// Здесь делать map and types for returned query objects
export const postQueryRepo = generateBaseQueryRepo<PostModel, PostsQueryRepoCustom>('posts', {});