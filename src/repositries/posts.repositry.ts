import { CommandRepo, QueryRepo } from './base.repositry';
import {PostModelType, Post, LikeStatus, CommentModelType} from '../types/types';
import { PostModel } from '../db/collections/posts.collection';
import {ObjectId} from "mongoose";


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
    // @ts-ignore
    async findById(userId: string | number | undefined, _id: ObjectId | string, excludeFields: object = {}) {
        const i = await super.findById(_id, excludeFields);
        if (!i) return null;
        if (!userId) userId = 'none';


        const userLikeStatus = i.extendedLikesInfo.newestLikes.find((i) => i.userId === userId);

        const myStatus = userLikeStatus && userLikeStatus.status
            ? userLikeStatus.status
            : LikeStatus.NONE;

        let res = i.toObject();
        // @ts-ignore
        res.extendedLikesInfo = {
            ...res.extendedLikesInfo,
            myStatus,
            // @ts-ignore
            newestLikes: res.extendedLikesInfo.newestLikes.length > 3
                ? res.extendedLikesInfo.newestLikes
                    .slice(1)
                    .slice(-3)
                    .map((e) => {
                    return {
                        userId: e.userId,
                        login: e.login,
                        addedAt: e.addedAt,
                    }
                }).reverse()
                : res.extendedLikesInfo.newestLikes
                    .map((e) => {
                        return {
                            userId: e.userId,
                            login: e.login,
                            addedAt: e.addedAt,
                        }
                    }).reverse()
        };
        // @ts-ignore
        res.id = res._id;
        // @ts-ignore
        delete res._id;
        // @ts-ignore
        delete res.__v;
        // @ts-ignore
        return res;
    }
    // @ts-ignore
    async find(
        userId: string | number | undefined,
        pageSize?: string,
        pageNumber?: string,
        sortBy?: string,
        sortDirection?: string,
        filters?: {},
    ) {
        if (!userId) userId = 'none';
        const res = await super.find(
            pageSize,
            pageNumber,
            sortBy,
            sortDirection,
            filters,
            {
                postId: 0,
            },
        );
        return {
            // @ts-ignore
            ...res,
            // @ts-ignore
            items: res.items.map((i: PostModelType) => {
                const userLikeStatus = i.extendedLikesInfo.newestLikes.find((i) => i.userId === userId);
                const myStatus = userLikeStatus
                    ? userLikeStatus.status
                    : LikeStatus.NONE;

                let res = i;
                // @ts-ignore
                res.extendedLikesInfo = {
                    ...res.extendedLikesInfo,
                    myStatus,
                    // @ts-ignore
                    newestLikes: res.extendedLikesInfo.newestLikes.length > 3
                        ? res.extendedLikesInfo.newestLikes
                            .slice(1)
                            .slice(-3)
                            .map((e) => {
                            return {
                                userId: e.userId,
                                login: e.login,
                                addedAt: e.addedAt,
                            }
                        }).reverse()
                        // @ts-ignore
                        : res.extendedLikesInfo.newestLikes
                            .map((e) => {
                                return {
                                    userId: e.userId,
                                    login: e.login,
                                    addedAt: e.addedAt,
                                }
                            }).reverse()
                }
                return {
                    ...i,
                    extendedLikesInfo: res.extendedLikesInfo
                }
            })
        }
    }
}
// @ts-ignore
export const postQueryRepo = new PostQueryRepo(PostModel);