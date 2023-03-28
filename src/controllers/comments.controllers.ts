import { CommentDomain } from "../domain/comments.domain";
import {Request, Response} from "express";
import {BaseGetQueryParams, HTTP_STATUSES, LikeStatus} from "../types/types";
import {commentsCommandRepo, commentsQueryRepo} from "../repositries/comments.repositry";


class CommentsControllers {
    constructor(
        protected commentsDomain: CommentDomain
    ) {
        this.commentsDomain = commentsDomain;
    }
    async getAll(req: Request<{}, {}, {}, BaseGetQueryParams>, res: Response) {
        const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
        // @ts-ignore
        const result = await this.commentsDomain.commentsQueryRepo.find(req.context?.user?.id, pageSize, pageNumber, sortBy, sortDirection);
        res.send(result);
    }
    async getOne(req: Request, res: Response) {
        // @ts-ignore
        const result = await this.commentsDomain.commentsQueryRepo.findById(req.context?.user?.id, req.params.id);
        if (!result) {
            res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
            return;
        }
        res.status(HTTP_STATUSES.OK_200).send(result);
    }

    async update(req: Request, res: Response){
        // @ts-ignore
        const isCommentOwnUser = await this.checkCommentOwnUser(req.params.id, req?.context?.user?.id);
        if (isCommentOwnUser === HTTP_STATUSES.NOT_FOUND_404) return res.status(HTTP_STATUSES.NOT_FOUND_404).send();
        if (!isCommentOwnUser) return res.status(HTTP_STATUSES.FORBIDDEN_403).send();

        const isUpdated = await this.commentsDomain.update(req.params.id, req.body);
        isUpdated
            ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
    }

    async likeUnlikeComment(req: Request, res: Response) {
        // @ts-ignore
        const findComment = await this.commentsDomain.commentsQueryRepo.findById(req.context.user.id, req.params.id);
        if (!findComment) return res.status(HTTP_STATUSES.NOT_FOUND_404).send();


        let likesInfo = findComment.likesInfo;
        // @ts-ignore
        if (!likesInfo.usersStatistics) likesInfo.usersStatistics = {};

        // @ts-ignore
        const oldStatus = likesInfo?.usersStatistics[req.context.user?.id] || LikeStatus.NONE;

        // @ts-ignore
        if (oldStatus === LikeStatus.LIKE) likesInfo.likesCount--;
        // @ts-ignore
        if (oldStatus === LikeStatus.DISLIKE) likesInfo.dislikesCount--;

        const bodyStatus = req.body.likeStatus;
        // @ts-ignore
        if (bodyStatus === LikeStatus.LIKE) likesInfo.likesCount++;
        // @ts-ignore
        else if (bodyStatus === LikeStatus.DISLIKE) likesInfo.dislikesCount++;

        // @ts-ignore
        likesInfo.usersStatistics[req.context.user?.id] = bodyStatus

        const isUpdated = await this.commentsDomain.update(req.params.id, {
            // @ts-ignore
            content: findComment.content,
            commentatorInfo: findComment.commentatorInfo,
            // @ts-ignore
            postId: findComment.postId,
            // @ts-ignore
            likesInfo: likesInfo
        });
        isUpdated
            ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
    }

    async delete(req: Request, res: Response) {
        // @ts-ignore
        const isCommentOwnUser = await this.checkCommentOwnUser(req.params.id, req?.context?.user?.id, req?.context?.user?.login);
        if (isCommentOwnUser === HTTP_STATUSES.NOT_FOUND_404) return res.status(HTTP_STATUSES.NOT_FOUND_404).send();
        if (!isCommentOwnUser) return res.status(HTTP_STATUSES.FORBIDDEN_403).send();

        const isDeleted = await this.commentsDomain.deleteOne(req.params.id);
        return isDeleted
            ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
    }

    async checkCommentOwnUser(commentId: string, userId: string | undefined, login: string) {
        const row = await this.commentsDomain.commentsQueryRepo.findById(login, commentId);
        if (!row) return HTTP_STATUSES.NOT_FOUND_404;
        return row?.commentatorInfo?.userId === userId;
    }
}

export const commentsDomain = new CommentDomain(commentsQueryRepo, commentsCommandRepo);
export const commentsControllers = new CommentsControllers(commentsDomain);