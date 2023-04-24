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
exports.commentsQueryRepo = exports.CommentsQueryRepo = exports.commentsCommandRepo = exports.CommentsCommandRepo = void 0;
const base_repositry_1 = require("./base.repositry");
const comments_collection_1 = require("../db/collections/comments.collection");
class CommentsCommandRepo extends base_repositry_1.CommandRepo {
}
exports.CommentsCommandRepo = CommentsCommandRepo;
// @ts-ignore
exports.commentsCommandRepo = new CommentsCommandRepo(comments_collection_1.CommentModel);
class CommentsQueryRepo extends base_repositry_1.QueryRepo {
    // @ts-ignore
    find(userId, pageSize, pageNumber, sortBy, sortDirection, filters) {
        const _super = Object.create(null, {
            find: { get: () => super.find }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const prepareFilters = {};
            if (filters === null || filters === void 0 ? void 0 : filters.postId)
                prepareFilters.postId = filters.postId;
            const res = yield _super.find.call(this, pageSize, pageNumber, sortBy, sortDirection, prepareFilters, {
                postId: 0,
            });
            return Object.assign(Object.assign({}, res), { 
                // @ts-ignore
                items: res.items.map((i) => {
                    var _a, _b, _c, _d, _e, _f;
                    const myStatus = userId && ((_a = i.likesInfo) === null || _a === void 0 ? void 0 : _a.usersStatistics) && ((_b = i.likesInfo) === null || _b === void 0 ? void 0 : _b.usersStatistics[userId])
                        ? (_c = i.likesInfo) === null || _c === void 0 ? void 0 : _c.usersStatistics[userId]
                        : 'None';
                    // @ts-ignore
                    (_d = i.likesInfo) === null || _d === void 0 ? true : delete _d.usersStatistics;
                    return Object.assign(Object.assign({}, i), { likesInfo: {
                            likesCount: ((_e = i === null || i === void 0 ? void 0 : i.likesInfo) === null || _e === void 0 ? void 0 : _e.likesCount) || 0,
                            dislikesCount: ((_f = i === null || i === void 0 ? void 0 : i.likesInfo) === null || _f === void 0 ? void 0 : _f.dislikesCount) || 0,
                            myStatus,
                        } });
                }) });
        });
    }
    // @ts-ignore
    findById(userId, id) {
        const _super = Object.create(null, {
            findById: { get: () => super.findById }
        });
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield _super.findById.call(this, id, { postId: 0 });
            if (!i)
                return null;
            const myStatus = userId && ((_a = i === null || i === void 0 ? void 0 : i.likesInfo) === null || _a === void 0 ? void 0 : _a.usersStatistics[userId])
                ? (_b = i.likesInfo) === null || _b === void 0 ? void 0 : _b.usersStatistics[userId]
                : 'None';
            let res = i.toObject();
            // @ts-ignore
            res.likesInfo = Object.assign(Object.assign({}, res.likesInfo), { myStatus: myStatus });
            // @ts-ignore
            res.id = res._id;
            // @ts-ignore
            delete res._id;
            // @ts-ignore
            delete res.__v;
            // @ts-ignore
            delete res.likesInfo.usersStatistics;
            return res;
        });
    }
    findByIdAllFields(userId, id) {
        const _super = Object.create(null, {
            findById: { get: () => super.findById }
        });
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield _super.findById.call(this, id, { postId: 0 });
            if (!i)
                return null;
            const myStatus = userId && ((_a = i === null || i === void 0 ? void 0 : i.likesInfo) === null || _a === void 0 ? void 0 : _a.usersStatistics[userId])
                ? (_b = i.likesInfo) === null || _b === void 0 ? void 0 : _b.usersStatistics[userId]
                : 'None';
            let res = i.toObject();
            // @ts-ignore
            res.likesInfo = Object.assign(Object.assign({}, res.likesInfo), { myStatus: myStatus });
            // @ts-ignore
            res.id = res._id;
            return res;
        });
    }
}
exports.CommentsQueryRepo = CommentsQueryRepo;
// @ts-ignore
exports.commentsQueryRepo = new CommentsQueryRepo(comments_collection_1.CommentModel);
