import { CommandRepo, QueryRepo } from './base.repositry';
import { CommentModel, Comment } from '../types/types';

class CommentsCommandRepo extends CommandRepo<CommentModel, Comment> {}
export const commentsCommandRepo =  new CommentsCommandRepo('comments');

class CommentsQueryRepo extends QueryRepo<CommentModel> {
    async find(
        pageSize?: string, 
        pageNumber?: string,
        sortBy?: string,
        sortDirection?: string,
        filters?: { postId?: string },
    ) {
        const prepareFilters: any = {};
        if (filters?.postId) prepareFilters.postId = filters.postId;
        return await super.find(pageSize, pageNumber, sortBy, sortDirection, prepareFilters, { postId: 0 });
    }
    async findById(id: string) {
        return await super.findById(id, { postId: 0 });
    }
}
export const commentsQueryRepo = new CommentsQueryRepo('comments');