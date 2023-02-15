import { generateBaseCommandRepo, generateBaseQueryRepo } from './base.repositry';
import { BlogModel, Blog } from '../types/types';
import { Document, WithId } from 'mongodb';
import { collection } from '../db'

type BlogsCommandRepoCustom = {}
export const blogsCommandRepo =  generateBaseCommandRepo<BlogModel, Blog, BlogsCommandRepoCustom>('blogs', {});

type BlogsQueryRepoCustom = {
    find: (searchNameTerm: string | null) => Promise<WithId<BlogModel & Document>[]>,
}
// Здесь делать map and types for returned query objects
export const blogsQueryRepo = generateBaseQueryRepo<BlogModel, BlogsQueryRepoCustom>('blogs', {
    find: (searchNameTerm: string | null) => {
        const queryFilter: any = {};
        if (searchNameTerm) {
            queryFilter.name = { $regex: searchNameTerm, $options: "i" }
        }
        return collection<BlogModel>('blogs')
            .find(queryFilter, { projection: { _id: 0 } })
            .toArray()
    },
});