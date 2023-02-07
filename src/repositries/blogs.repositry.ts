import generateBaseRepo from './base.repositry';
import { BlogModel, Blog } from '../types/types';

const products: Array<BlogModel> = [
    { id: 1, name: 'Apple', description: 'Apple corporation', websiteUrl: 'https://apple.com' },
    { id: 2, name: 'Samsung', description: 'Samsung corporation', websiteUrl: 'https://samsung.com' },
];

type BlogsRepoCustom = {}

export default generateBaseRepo<BlogModel, Blog, BlogsRepoCustom>(products, {});