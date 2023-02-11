import generateBaseRepo from './base.repositry';
import { BlogModel, Blog, BaseDbEntity } from '../types/types';
import { collection } from '../db/index'

type BlogsRepoCustom = {}
export default generateBaseRepo<BlogModel, Blog, BlogsRepoCustom>('blogs', {});