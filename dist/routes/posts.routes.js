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
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    const result = yield posts_repositry_1.postQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection, {});
    res.send(result);
}));
router.get('/:id/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield posts_repositry_1.postQueryRepo.findById(req.params.id);
    if (!result) {
        res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    res.status(types_1.HTTP_STATUSES.OK_200).send(result);
}));
router.get('/:postId/comments', auth_middleware_1.getUserByRefreshJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    const isPostExist = yield posts_repositry_1.postQueryRepo.findById(req.params.postId || 'undefined');
    if (!isPostExist)
        return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
    // @ts-ignore
    const result = yield comments_repositry_1.commentsQueryRepo.find(req.context.user.id, pageSize, pageNumber, sortBy, sortDirection, { postId: req.params.postId });
    if (!result)
        return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
    res.status(types_1.HTTP_STATUSES.OK_200).send(result);
}));
router.post('/', auth_middleware_1.authMiddleware, ...posts_middleware_1.createPostsBody, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = yield posts_domain_1.default.create(req.body);
    const result = yield posts_repositry_1.postQueryRepo.findById(id.toString());
    res.status(types_1.HTTP_STATUSES.CREATED_201).send(result);
}));
router.post('/:postId/comments', auth_middleware_1.authMiddlewareJWT, ...comments_middleware_1.createCommentsBody, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const post = yield posts_repositry_1.postQueryRepo.findById(req.params.postId);
    if (!post)
        return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
    const createdId = yield comments_controllers_1.commentsDomain.create(Object.assign(Object.assign({}, req.body), { postId: req.params.postId, commentatorInfo: {
            // @ts-ignore
            userId: (_a = req.context.user) === null || _a === void 0 ? void 0 : _a.id,
            userLogin: (_b = req.context.user) === null || _b === void 0 ? void 0 : _b.login
        } }));
    // @ts-ignore
    const result = yield comments_repositry_1.commentsQueryRepo.findById((_c = req.context.user) === null || _c === void 0 ? void 0 : _c.id, createdId);
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
