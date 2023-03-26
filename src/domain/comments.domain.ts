import { commentsCommandRepo, commentsQueryRepo } from '../repositries/comments.repositry';
import { Comment, HTTP_STATUSES, UserModelType } from '../types/types';
import {UserDomain} from "./users.domain";
import { CommentsQueryRepo, CommentsCommandRepo } from "../repositries/comments.repositry";


export class CommentDomain {
    constructor(
        public commentsQueryRepo: CommentsQueryRepo,
        public commentsCommandRepo: CommentsCommandRepo,
    ) {
        this.commentsQueryRepo = commentsQueryRepo;
        this.commentsCommandRepo = commentsCommandRepo;
    }
    async create(body: Comment) {
        const res = await this.commentsCommandRepo.create({
            content: body.content,
            commentatorInfo: body.commentatorInfo,
            postId: body.postId,
        });
        return res;
    }
    async update(id: string, body: Comment) {
        return await commentsCommandRepo.update(id, body);
    }
    async deleteOne(id: string) {
        return await commentsCommandRepo.delete(id);
    }
    async deleteAll() {
        return await commentsCommandRepo._deleteAll();
    }
}
