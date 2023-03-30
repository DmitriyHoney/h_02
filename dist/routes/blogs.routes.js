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
const blogs_middleware_1 = require("../middlewares/blogs.middleware");
const posts_middleware_1 = require("../middlewares/posts.middleware");
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const blogs_repositry_1 = require("../repositries/blogs.repositry");
const posts_repositry_1 = require("../repositries/posts.repositry");
const blogs_domain_1 = __importDefault(require("../domain/blogs.domain"));
const posts_domain_1 = __importDefault(require("../domain/posts.domain"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, pageNumber, sortBy, sortDirection, searchNameTerm } = req.query;
    const result = yield blogs_repositry_1.blogsQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection, { searchNameTerm });
    res.send(result);
}));
router.get('/:id/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield blogs_repositry_1.blogsQueryRepo.findById(req.params.id);
    if (!result) {
        res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    res.status(types_1.HTTP_STATUSES.OK_200).send(result);
}));
router.get('/:blogId/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    // @ts-ignore
    const result = yield posts_repositry_1.postQueryRepo.findByBlogId(pageSize, pageNumber, sortBy, sortDirection, req.params.blogId);
    if (!result || result.items.length === 0) {
        res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    res.status(types_1.HTTP_STATUSES.OK_200).send(result);
}));
router.post('/:blogId/posts', auth_middleware_1.authMiddleware, ...posts_middleware_1.createPostsBodyWithoutBlogId, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result1 = yield blogs_repositry_1.blogsQueryRepo.findById(req.params.blogId);
    if (!result1) {
        res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    const id = yield posts_domain_1.default.create(Object.assign(Object.assign({}, req.body), { blogId: req.params.blogId }));
    // @ts-ignore
    const result = yield posts_repositry_1.postQueryRepo.findById(id);
    if (!result) {
        res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    res.status(types_1.HTTP_STATUSES.CREATED_201).send(result);
}));
router.post('/', auth_middleware_1.authMiddleware, ...blogs_middleware_1.createBlogsBody, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = yield blogs_domain_1.default.create(req.body);
    // @ts-ignore
    const result = yield blogs_repositry_1.blogsQueryRepo.findById(id);
    res.status(types_1.HTTP_STATUSES.CREATED_201).send(result);
}));
router.put('/:id/', auth_middleware_1.authMiddleware, ...blogs_middleware_1.createBlogsBody, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isUpdated = yield blogs_domain_1.default.update(req.params.id, req.body);
    return isUpdated
        ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
}));
router.delete('/:id/', auth_middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isDeleted = yield blogs_domain_1.default.deleteOne(req.params.id);
    return isDeleted
        ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
}));
exports.default = router;
