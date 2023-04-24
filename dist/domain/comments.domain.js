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
exports.CommentDomain = void 0;
const comments_repositry_1 = require("../repositries/comments.repositry");
class CommentDomain {
    constructor(commentsQueryRepo, commentsCommandRepo) {
        this.commentsQueryRepo = commentsQueryRepo;
        this.commentsCommandRepo = commentsCommandRepo;
        this.commentsQueryRepo = commentsQueryRepo;
        this.commentsCommandRepo = commentsCommandRepo;
    }
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.commentsCommandRepo.create({
                content: body.content,
                commentatorInfo: body.commentatorInfo,
                postId: body.postId,
            });
            return res;
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield comments_repositry_1.commentsCommandRepo.update(id, body);
        });
    }
    deleteOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield comments_repositry_1.commentsCommandRepo.delete(id);
        });
    }
    deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield comments_repositry_1.commentsCommandRepo._deleteAll();
        });
    }
}
exports.CommentDomain = CommentDomain;
