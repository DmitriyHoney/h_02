import { CommandRepo, QueryRepo } from './base.repositry';
import { PostModel, Post } from '../types/types';

class PostCommandRepo extends CommandRepo<PostModel, Post> {}
export const postCommandRepo = new PostCommandRepo('post');


class PostQueryRepo extends QueryRepo<PostModel> {
    async findByBlogId(
        pageSize?: string, 
        pageNumber?: string,
        sortBy?: string,
        sortDirection?: string,
        // @ts-ignore
        blogId: string,
    ) {
        return await super.find(pageSize, pageNumber, sortBy, sortDirection, { blogId: blogId });
    }
}
export const postQueryRepo = new PostQueryRepo('post');