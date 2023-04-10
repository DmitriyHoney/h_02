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
const posts_repositry_1 = require("../repositries/posts.repositry");
exports.default = {
    create: (body) => __awaiter(void 0, void 0, void 0, function* () {
        return yield posts_repositry_1.postCommandRepo.create(Object.assign(Object.assign({}, body), { blogName: body.blogName ? body.blogName : '' }));
    }),
    update: (id, body) => __awaiter(void 0, void 0, void 0, function* () { return yield posts_repositry_1.postCommandRepo.update(id, body); }),
    deleteOne: (id) => __awaiter(void 0, void 0, void 0, function* () { return yield posts_repositry_1.postCommandRepo.delete(id); }),
    deleteAll: () => __awaiter(void 0, void 0, void 0, function* () { return yield posts_repositry_1.postCommandRepo._deleteAll(); }),
};
