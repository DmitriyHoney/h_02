import { blogsCommandRepo } from '../repositries/blogs.repositry';
import { Blog } from '../types/types';

export default {
    create: async (body: Blog) => {
        const res = await blogsCommandRepo.create({
            ...body, 
            isMembership: false,
        });
        return res;
    },
    update: async (id: string, body: Blog) => await blogsCommandRepo.update(id, body),
    deleteOne: async (id: string) => await blogsCommandRepo.delete(id),
    deleteAll: async () => await blogsCommandRepo._deleteAll()
};