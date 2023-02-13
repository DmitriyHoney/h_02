import postsRepo from '../repositries/posts.repositry';
import { Post } from '../types/types';

export default {
    getAll: async () =>  await postsRepo.find(),
    getOne: async (id: string) => await postsRepo.findById(id),
    create: async (body: Post) => {
        return await postsRepo.create({
            ...body,
            blogName: body.blogName ? body.blogName : ''
        });
    },
    update: async (id: string, body: Post) => await postsRepo.update(id, body),
    deleteOne: async (id: string) => await postsRepo.delete(id),
    deleteAll: async () => await postsRepo._deleteAll(),
};