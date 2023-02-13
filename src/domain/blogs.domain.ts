import blogsRepo from '../repositries/blogs.repositry';
import { Blog } from '../types/types';

export default {
    getAll: async () => await blogsRepo.find(),
    getOne: async (id: string) => await blogsRepo.findById(id),
    create: async (body: Blog) => {
        return await blogsRepo.create({
            ...body, 
            isMembership: false,
        });
    },
    update: async (id: string, body: Blog) => await blogsRepo.update(id, body),
    deleteOne: async (id: string) => await blogsRepo.delete(id),
    deleteAll: async () => await blogsRepo._deleteAll()
};