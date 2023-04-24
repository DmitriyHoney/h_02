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
exports.postQueryRepo = exports.postCommandRepo = void 0;
const base_repositry_1 = require("./base.repositry");
const types_1 = require("../types/types");
const posts_collection_1 = require("../db/collections/posts.collection");
class PostCommandRepo extends base_repositry_1.CommandRepo {
}
// @ts-ignore
exports.postCommandRepo = new PostCommandRepo(posts_collection_1.PostModel);
class PostQueryRepo extends base_repositry_1.QueryRepo {
    findByBlogId(pageSize, pageNumber, sortBy, sortDirection, 
    // @ts-ignore
    blogId) {
        const _super = Object.create(null, {
            find: { get: () => super.find }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.find.call(this, pageSize, pageNumber, sortBy, sortDirection, { blogId: blogId });
        });
    }
    // @ts-ignore
    findById(userId, _id, excludeFields = {}) {
        const _super = Object.create(null, {
            findById: { get: () => super.findById }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield _super.findById.call(this, _id, excludeFields);
            if (!i)
                return null;
            if (!userId)
                userId = 'none';
            const userLikeStatus = i.extendedLikesInfo.newestLikes.find((i) => i.userId === userId);
            const myStatus = userLikeStatus
                ? userLikeStatus.status
                : types_1.LikeStatus.NONE;
            let res = i.toObject();
            // @ts-ignore
            res.extendedLikesInfo = Object.assign(Object.assign({}, res.extendedLikesInfo), { myStatus, 
                // @ts-ignore
                newestLikes: res.extendedLikesInfo.newestLikes.length > 3
                    ? res.extendedLikesInfo.newestLikes
                        .filter((u) => (u === null || u === void 0 ? void 0 : u.status) === types_1.LikeStatus.LIKE)
                        .slice(1)
                        .slice(-3)
                        .map((e) => {
                        return {
                            userId: e.userId,
                            login: e.login,
                            addedAt: e.addedAt,
                        };
                    }).reverse()
                    : res.extendedLikesInfo.newestLikes
                        .filter((u) => (u === null || u === void 0 ? void 0 : u.status) === types_1.LikeStatus.LIKE)
                        .map((e) => {
                        return {
                            userId: e.userId,
                            login: e.login,
                            addedAt: e.addedAt,
                        };
                    }).reverse() });
            // @ts-ignore
            res.id = res._id;
            // @ts-ignore
            delete res._id;
            // @ts-ignore
            delete res.__v;
            // @ts-ignore
            return res;
        });
    }
    // @ts-ignore
    find(userId, pageSize, pageNumber, sortBy, sortDirection, filters) {
        const _super = Object.create(null, {
            find: { get: () => super.find }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId)
                userId = 'none';
            const res = yield _super.find.call(this, pageSize, pageNumber, sortBy, sortDirection, filters, {
                postId: 0,
            });
            return Object.assign(Object.assign({}, res), { 
                // @ts-ignore
                items: res.items.map((i) => {
                    const userLikeStatus = i.extendedLikesInfo.newestLikes.find((i) => i.userId === userId);
                    const myStatus = userLikeStatus
                        ? userLikeStatus.status
                        : types_1.LikeStatus.NONE;
                    let res = i;
                    // @ts-ignore
                    res.extendedLikesInfo = Object.assign(Object.assign({}, res.extendedLikesInfo), { myStatus, 
                        // @ts-ignore
                        newestLikes: res.extendedLikesInfo.newestLikes.length > 3
                            ? res.extendedLikesInfo.newestLikes
                                .filter((u) => (u === null || u === void 0 ? void 0 : u.status) === types_1.LikeStatus.LIKE)
                                .slice(1)
                                .slice(-3)
                                .map((e) => {
                                return {
                                    userId: e.userId,
                                    login: e.login,
                                    addedAt: e.addedAt,
                                };
                            }).reverse()
                            // @ts-ignore
                            : res.extendedLikesInfo.newestLikes
                                .filter((u) => (u === null || u === void 0 ? void 0 : u.status) === types_1.LikeStatus.LIKE)
                                .map((e) => {
                                return {
                                    userId: e.userId,
                                    login: e.login,
                                    addedAt: e.addedAt,
                                };
                            }).reverse() });
                    return Object.assign(Object.assign({}, i), { extendedLikesInfo: res.extendedLikesInfo });
                }) });
        });
    }
}
// @ts-ignore
exports.postQueryRepo = new PostQueryRepo(posts_collection_1.PostModel);
