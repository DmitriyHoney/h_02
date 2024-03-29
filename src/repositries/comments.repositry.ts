import { CommandRepo, QueryRepo } from './base.repositry';
import { CommentModelType, Comment } from '../types/types';
import { CommentModel } from '../db/collections/comments.collection';

export class CommentsCommandRepo extends CommandRepo<CommentModelType, Comment> {}

// @ts-ignore
export const commentsCommandRepo =  new CommentsCommandRepo(CommentModel);

export class CommentsQueryRepo extends QueryRepo<CommentModelType> {
    // @ts-ignore
    async find(
        userId: string | number | undefined,
        pageSize?: string,
        pageNumber?: string,
        sortBy?: string,
        sortDirection?: string,
        filters?: { postId?: string },
    ) {
        const prepareFilters: any = {};
        if (filters?.postId) prepareFilters.postId = filters.postId;
        const res = await super.find(
            pageSize,
            pageNumber,
            sortBy,
            sortDirection,
            prepareFilters,
            {
                postId: 0,
            },
        );
        return {
            // @ts-ignore
            ...res,
            // @ts-ignore
            items: res.items.map((i: CommentModelType) => {
                const myStatus = userId && i.likesInfo?.usersStatistics && i.likesInfo?.usersStatistics[userId]
                    ? i.likesInfo?.usersStatistics[userId]
                    : 'None';
                // @ts-ignore
                delete i.likesInfo?.usersStatistics;
                return {
                    ...i,
                    likesInfo: {
                        likesCount: i?.likesInfo?.likesCount || 0,
                        dislikesCount: i?.likesInfo?.dislikesCount || 0,
                        myStatus,
                    }
                }
            })
        }
    }
    // @ts-ignore
    async findById(userId: string | number | undefined, id: string) {
        const i = await super.findById(id, { postId: 0 });
        if (!i) return null;
        const myStatus = userId && i?.likesInfo?.usersStatistics[userId]
            ? i.likesInfo?.usersStatistics[userId]
            : 'None';

        let res = i.toObject();
        // @ts-ignore
        res.likesInfo = { ...res.likesInfo, myStatus: myStatus };
        // @ts-ignore
        res.id = res._id;
        // @ts-ignore
        delete res._id;
        // @ts-ignore
        delete res.__v;
        // @ts-ignore
        delete res.likesInfo.usersStatistics;
        return res;
    }

    async findByIdAllFields(userId: string | number | undefined, id: string) {
        const i = await super.findById(id, { postId: 0 });
        if (!i) return null;
        const myStatus = userId && i?.likesInfo?.usersStatistics[userId]
            ? i.likesInfo?.usersStatistics[userId]
            : 'None';

        let res = i.toObject();
        // @ts-ignore
        res.likesInfo = { ...res.likesInfo, myStatus: myStatus };
        // @ts-ignore
        res.id = res._id;
        return res;
    }
}

// @ts-ignore
export const commentsQueryRepo = new CommentsQueryRepo(CommentModel);