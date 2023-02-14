import { generateBaseCommandRepo, generateBaseQueryRepo } from './base.repositry';
import { BlogModel, Blog } from '../types/types';

type BlogsCommandRepoCustom = {}
export const blogsCommandRepo =  generateBaseCommandRepo<BlogModel, Blog, BlogsCommandRepoCustom>('blogs', {});

type BlogsQueryRepoCustom = {}
// TODO сделать маперы на queryRepo 
export const blogsQueryRepo = generateBaseQueryRepo<BlogModel, BlogsQueryRepoCustom>('blogs', {});