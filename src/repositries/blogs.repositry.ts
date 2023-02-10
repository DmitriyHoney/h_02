import generateBaseRepo from './base.repositry';
import { BlogModel, Blog } from '../types/types';

type BlogsRepoCustom = {}
export default generateBaseRepo<BlogModel, Blog, BlogsRepoCustom>('blogs', {});