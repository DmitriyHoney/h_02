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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const posts_middleware_1 = require("../middlewares/posts.middleware");
const comments_middleware_1 = require("../middlewares/comments.middleware");
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const posts_domain_1 = __importDefault(require("../domain/posts.domain"));
const posts_repositry_1 = require("../repositries/posts.repositry");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const comments_repositry_1 = require("../repositries/comments.repositry");
const comments_controllers_1 = require("../controllers/comments.controllers");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.getUserByRefreshJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    // @ts-ignore
    const result = yield posts_repositry_1.postQueryRepo.find((_b = (_a = req.context) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id, pageSize, pageNumber, sortBy, sortDirection, {});
    res.send(result);
}));
router.get('/:id/', auth_middleware_1.getUserByRefreshJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    // @ts-ignore
    const result = yield posts_repositry_1.postQueryRepo.findById((_d = (_c = req.context) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.id, req.params.id);
    if (!result) {
        res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    console.log('result', result);
    res.status(types_1.HTTP_STATUSES.OK_200).send(result);
}));
router.get('/:postId/comments', auth_middleware_1.getUserByRefreshJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    // @ts-ignore
    const isPostExist = yield posts_repositry_1.postQueryRepo.findById((_f = (_e = req.context) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.id, req.params.postId || 'undefined');
    if (!isPostExist)
        return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
    // @ts-ignore
    const result = yield comments_repositry_1.commentsQueryRepo.find(req.context.user.id, pageSize, pageNumber, sortBy, sortDirection, { postId: req.params.postId });
    if (!result)
        return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
    res.status(types_1.HTTP_STATUSES.OK_200).send(result);
}));
router.post('/', auth_middleware_1.authMiddleware, ...posts_middleware_1.createPostsBody, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    const id = yield posts_domain_1.default.create(req.body);
    // @ts-ignore
    const result = yield posts_repositry_1.postQueryRepo.findById((_h = (_g = req.context) === null || _g === void 0 ? void 0 : _g.user) === null || _h === void 0 ? void 0 : _h.id, id.toString());
    res.status(types_1.HTTP_STATUSES.CREATED_201).send(result);
}));
router.put('/:postId/like-status', auth_middleware_1.authMiddlewareJWT, ...posts_middleware_1.createLikeForPostBody, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l, _m, _o, _p;
    // @ts-ignore
    const post = yield posts_repositry_1.postQueryRepo.findById((_k = (_j = req.context) === null || _j === void 0 ? void 0 : _j.user) === null || _k === void 0 ? void 0 : _k.id, req.params.postId);
    if (!post)
        return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
    let likesInfo = post.extendedLikesInfo;
    // @ts-ignore
    if (!likesInfo.newestLikes)
        likesInfo.newestLikes = [];
    // @ts-ignore
    const userId = (_m = (_l = req.context) === null || _l === void 0 ? void 0 : _l.user) === null || _m === void 0 ? void 0 : _m.id;
    // @ts-ignore
    const existItemLikeStatus = likesInfo === null || likesInfo === void 0 ? void 0 : likesInfo.newestLikes.find((i) => i.userId === userId);
    const oldStatus = (existItemLikeStatus === null || existItemLikeStatus === void 0 ? void 0 : existItemLikeStatus.status) || types_1.LikeStatus.NONE;
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
    likesInfo.newestLikes = likesInfo.newestLikes
        // @ts-ignore
        .filter((i) => { var _a; return i.userId !== ((_a = req.context.user) === null || _a === void 0 ? void 0 : _a.id); });
    if (bodyStatus !== types_1.LikeStatus.NONE && bodyStatus) {
        const item = {
            // @ts-ignore
            userId: (_o = req.context.user) === null || _o === void 0 ? void 0 : _o.id,
            login: ((_p = req.context.user) === null || _p === void 0 ? void 0 : _p.login) || '',
            status: bodyStatus,
            addedAt: new Date().toISOString()
        };
        likesInfo.newestLikes.push(item);
    }
    // @ts-ignore
    const isUpdated = yield posts_repositry_1.postCommandRepo.update(req.params.postId, {
        extendedLikesInfo: likesInfo
    });
    return isUpdated
        ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
}));
router.post('/:postId/comments', auth_middleware_1.authMiddlewareJWT, ...comments_middleware_1.createCommentsBody, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _q, _r, _s;
    // @ts-ignore
    const post = yield posts_repositry_1.postQueryRepo.findById(req.context.user.id, req.params.postId);
    if (!post)
        return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
    const createdId = yield comments_controllers_1.commentsDomain.create(Object.assign(Object.assign({}, req.body), { postId: req.params.postId, commentatorInfo: {
            // @ts-ignore
            userId: (_q = req.context.user) === null || _q === void 0 ? void 0 : _q.id,
            userLogin: (_r = req.context.user) === null || _r === void 0 ? void 0 : _r.login
        } }));
    // @ts-ignore
    const result = yield comments_repositry_1.commentsQueryRepo.findById((_s = req.context.user) === null || _s === void 0 ? void 0 : _s.id, createdId);
    res.status(types_1.HTTP_STATUSES.CREATED_201).send(result);
}));
router.put('/:id/', auth_middleware_1.authMiddleware, ...posts_middleware_1.createPostsBody, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isUpdated = yield posts_domain_1.default.update(req.params.id, req.body);
    return isUpdated
        ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
}));
router.delete('/:id/', auth_middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isDeleted = yield posts_domain_1.default.deleteOne(req.params.id);
    return isDeleted
        ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
}));
exports.default = router;
