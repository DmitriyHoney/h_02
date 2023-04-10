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
exports.blogsQueryRepo = exports.blogsCommandRepo = void 0;
const base_repositry_1 = require("./base.repositry");
class BlogsCommandRepo extends base_repositry_1.CommandRepo {
}
exports.blogsCommandRepo = new BlogsCommandRepo('blogs');
class BlogsQueryRepo extends base_repositry_1.QueryRepo {
    find(pageSize, pageNumber, sortBy, sortDirection, filters) {
        const _super = Object.create(null, {
            find: { get: () => super.find }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const prepareFilters = {};
            if (filters === null || filters === void 0 ? void 0 : filters.searchNameTerm)
                prepareFilters.name = { $regex: filters.searchNameTerm, $options: "i" };
            return yield _super.find.call(this, pageSize, pageNumber, sortBy, sortDirection, prepareFilters);
        });
    }
}
exports.blogsQueryRepo = new BlogsQueryRepo('blogs');
