import { generateBaseCommandRepo, generateBaseQueryRepo } from './base.repositry';
import { PostModel, Post } from '../types/types';

type PostsCommandRepoCustom = {}
export const postCommandRepo = generateBaseCommandRepo<PostModel, Post, PostsCommandRepoCustom>('posts', {});

type PostsQueryRepoCustom = {}
// TODO сделать маперы на queryRepo 
export const postQueryRepo = generateBaseQueryRepo<PostModel, PostsQueryRepoCustom>('posts', {});