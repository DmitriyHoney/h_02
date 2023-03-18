import { commentsCommandRepo, commentsQueryRepo } from '../repositries/comments.repositry';
import { Comment, HTTP_STATUSES, UserModelType } from '../types/types';

export default {
    create: async (body: Comment) => {
        const res = await commentsCommandRepo.create({ 
            content: body.content, 
            commentatorInfo: body.commentatorInfo,
            postId: body.postId,
        });
        return res;
    },
    update: async (id: string, body: Comment) => {
        return await commentsCommandRepo.update(id, {
            content: body.content,
            postId: body.postId
        });
    },
    deleteOne: async (id: string) => await commentsCommandRepo.delete(id),
    deleteAll: async () => await commentsCommandRepo._deleteAll()
};