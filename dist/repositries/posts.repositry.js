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
}
// @ts-ignore
exports.postQueryRepo = new PostQueryRepo(posts_collection_1.PostModel);
