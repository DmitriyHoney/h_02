import { CommandRepo, QueryRepo } from './base.repositry';
import { PostModelType, Post } from '../types/types';
import { PostModel } from '../db/collections/posts.collection';


class PostCommandRepo extends CommandRepo<PostModelType, Post> {}
// @ts-ignore
export const postCommandRepo = new PostCommandRepo(PostModel);


class PostQueryRepo extends QueryRepo<PostModelType> {
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
// @ts-ignore
export const postQueryRepo = new PostQueryRepo(PostModel);