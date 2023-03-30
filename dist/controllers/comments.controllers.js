"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentsControllers = exports.commentsDomain = void 0;
const comments_domain_1 = require("../domain/comments.domain");
const types_1 = require("../types/types");
const comments_repositry_1 = require("../repositries/comments.repositry");
class CommentsControllers {
    constructor(commentsDomain) {
        this.commentsDomain = commentsDomain;
        this.commentsDomain = commentsDomain;
    }
    getAll(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
            // @ts-ignore
            const result = yield this.commentsDomain.commentsQueryRepo.find((_b = (_a = req.context) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id, pageSize, pageNumber, sortBy, sortDirection);
            res.send(result);
        });
    }
    getOne(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const result = yield this.commentsDomain.commentsQueryRepo.findById((_b = (_a = req.context) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id, req.params.id);
            if (!result) {
                res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
                return;
            }
            res.status(types_1.HTTP_STATUSES.OK_200).send(result);
        });
    }
    update(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const isCommentOwnUser = yield this.checkCommentOwnUser(req.params.id, (_b = (_a = req === null || req === void 0 ? void 0 : req.context) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
            if (isCommentOwnUser === types_1.HTTP_STATUSES.NOT_FOUND_404)
                return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
            if (!isCommentOwnUser)
                return res.status(types_1.HTTP_STATUSES.FORBIDDEN_403).send();
            const isUpdated = yield this.commentsDomain.update(req.params.id, req.body);
            isUpdated
                ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
                : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
        });
    }
    likeUnlikeComment(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const findComment = yield this.commentsDomain.commentsQueryRepo.findById(req.context.user.id, req.params.id);
            if (!findComment)
                return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
            let likesInfo = findComment.likesInfo;
            // @ts-ignore
            if (!likesInfo.usersStatistics)
                likesInfo.usersStatistics = {};
            // @ts-ignore
            const oldStatus = (likesInfo === null || likesInfo === void 0 ? void 0 : likesInfo.usersStatistics[(_a = req.context.user) === null || _a === void 0 ? void 0 : _a.id]) || types_1.LikeStatus.NONE;
            // @ts-ignore
            if (oldStatus === types_1.LikeStatus.LIKE)
                likesInfo.likesCount--;
            // @ts-ignore
            if (oldStatus === types_1.LikeStatus.DISLIKE)
                likesInfo.dislikesCount--;
            const bodyStatus = req.body.likeStatus;
            // @ts-ignore
            if (bodyStatus === types_1.LikeStatus.LIKE)
                likesInfo.likesCount++;
            // @ts-ignore
            else if (bodyStatus === types_1.LikeStatus.DISLIKE)
                likesInfo.dislikesCount++;
            // @ts-ignore
            likesInfo.usersStatistics[(_b = req.context.user) === null || _b === void 0 ? void 0 : _b.id] = bodyStatus;
            const isUpdated = yield this.commentsDomain.update(req.params.id, {
                // @ts-ignore
                content: findComment.content,
                commentatorInfo: findComment.commentatorInfo,
                // @ts-ignore
                postId: findComment.postId,
                // @ts-ignore
                likesInfo: likesInfo
            });
            isUpdated
                ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
                : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
        });
    }
    delete(req, res) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const isCommentOwnUser = yield this.checkCommentOwnUser(req.params.id, (_b = (_a = req === null || req === void 0 ? void 0 : req.context) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id, (_d = (_c = req === null || req === void 0 ? void 0 : req.context) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.login);
            if (isCommentOwnUser === types_1.HTTP_STATUSES.NOT_FOUND_404)
                return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
            if (!isCommentOwnUser)
                return res.status(types_1.HTTP_STATUSES.FORBIDDEN_403).send();
            const isDeleted = yield this.commentsDomain.deleteOne(req.params.id);
            return isDeleted
                ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
                : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        });
    }
    checkCommentOwnUser(commentId, userId, login) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.commentsDomain.commentsQueryRepo.findById(login, commentId);
            if (!row)
                return types_1.HTTP_STATUSES.NOT_FOUND_404;
            return ((_a = row === null || row === void 0 ? void 0 : row.commentatorInfo) === null || _a === void 0 ? void 0 : _a.userId) === userId;
        });
    }
}
exports.commentsDomain = new comments_domain_1.CommentDomain(comments_repositry_1.commentsQueryRepo, comments_repositry_1.commentsCommandRepo);
exports.commentsControllers = new CommentsControllers(exports.commentsDomain);
