import { CommandRepo, QueryRepo } from './base.repositry';
import { CommentModelType, Comment } from '../types/types';
import { CommentModel } from '../db/collections/comments.collection';

class CommentsCommandRepo extends CommandRepo<CommentModelType, Comment> {}

// @ts-ignore
export const commentsCommandRepo =  new CommentsCommandRepo(CommentModel);

class CommentsQueryRepo extends QueryRepo<CommentModelType> {
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
// @ts-ignore
export const commentsQueryRepo = new CommentsQueryRepo(CommentModel);