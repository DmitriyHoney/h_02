import { CommandRepo, QueryRepo } from './base.repositry';
import { BlogModelType, Blog, PaginationSortingType } from '../types/types';
import { WithId, Document } from 'mongodb';
import { BlogModel } from '../db/collections/blogs.collection';

class BlogsCommandRepo extends CommandRepo<BlogModelType, Blog> {}
export const blogsCommandRepo =  new BlogsCommandRepo(BlogModel);

class BlogsQueryRepo extends QueryRepo<BlogModelType> {
    async find(
        pageSize?: string, 
        pageNumber?: string,
        sortBy?: string,
        sortDirection?: string,
        filters?: { searchNameTerm?: string },
    ) {
        const prepareFilters: any = {};
        if (filters?.searchNameTerm) prepareFilters.name = { $regex: filters.searchNameTerm, $options: "i" };
        return await super.find(pageSize, pageNumber, sortBy, sortDirection, prepareFilters, { updatedAt: 0 });
    }
}
export const blogsQueryRepo = new BlogsQueryRepo(BlogModel);