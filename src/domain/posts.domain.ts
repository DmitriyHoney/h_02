import { postCommandRepo } from '../repositries/posts.repositry';
import { Post } from '../types/types';

export default {
    create: async (body: Post) => {
        return await postCommandRepo.create({
            ...body,
            blogName: body.blogName ? body.blogName : ''
        });
    },
    update: async (id: string, body: Post) => await postCommandRepo.update(id, body),
    deleteOne: async (id: string) => await postCommandRepo.delete(id),
    deleteAll: async () => await postCommandRepo._deleteAll(),
};