import { CommandRepo, QueryRepo } from './base.repositry';
import { BlogModel, Blog, PaginationSortingType } from '../types/types';
import { WithId, Document } from 'mongodb';

class BlogsCommandRepo extends CommandRepo<BlogModel, Blog> {}
export const blogsCommandRepo =  new BlogsCommandRepo('blogs');

class BlogsQueryRepo extends QueryRepo<BlogModel> {
    async find(
        pageSize?: string, 
        pageNumber?: string,
        sortBy?: string,
        sortDirection?: string,
        filters?: { searchNameTerm?: string },
    ) {
        const prepareFilters: any = {};
        if (filters?.searchNameTerm) prepareFilters.name = { $regex: filters.searchNameTerm, $options: "i" };
        return await super.find(pageSize, pageNumber, sortBy, sortDirection, prepareFilters);
    }
}
export const blogsQueryRepo = new BlogsQueryRepo('blogs');