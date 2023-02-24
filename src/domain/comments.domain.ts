import { commentsCommandRepo, commentsQueryRepo } from '../repositries/comments.repositry';
import { Comment, HTTP_STATUSES, UserModel } from '../types/types';

export default {
    create: async (body: Comment) => {
        const res = await commentsCommandRepo.create({ content: body.content, commentatorInfo: body.commentatorInfo });
        return res;
    },
    update: async (id: string, body: Comment) => {
        return await commentsCommandRepo.update(id, { content: body.content });
    },
    deleteOne: async (id: string) => await commentsCommandRepo.delete(id),
    deleteAll: async () => await commentsCommandRepo._deleteAll()
};