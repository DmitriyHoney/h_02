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
exports.usersQueryRepo = exports.userMappersQuery = exports.UsersQueryRepo = exports.usersCommandRepo = exports.UsersCommandRepo = void 0;
const base_repositry_1 = require("./base.repositry");
const users_collection_1 = require("../db/collections/users.collection");
class UsersCommandRepo extends base_repositry_1.CommandRepo {
}
exports.UsersCommandRepo = UsersCommandRepo;
// @ts-ignore
exports.usersCommandRepo = new UsersCommandRepo(users_collection_1.UserModel);
const baseUserExludeFields = {
    confirmedInfo: 0,
    password: 0,
    updatedAt: 0,
};
class UsersQueryRepo extends base_repositry_1.QueryRepo {
    find(pageSize, pageNumber, sortBy, sortDirection, filters) {
        const _super = Object.create(null, {
            find: { get: () => super.find }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const prepareFilters = {};
            if (filters === null || filters === void 0 ? void 0 : filters.searchLoginTerm) {
                if (!prepareFilters.$or)
                    prepareFilters.$or = [];
                prepareFilters.$or.push({ login: { $regex: filters.searchLoginTerm, $options: "i" } });
            }
            if (filters === null || filters === void 0 ? void 0 : filters.searchEmailTerm) {
                if (!prepareFilters.$or)
                    prepareFilters.$or = [];
                prepareFilters.$or.push({ email: { $regex: filters.searchEmailTerm, $options: "i" } });
            }
            return yield _super.find.call(this, pageSize, pageNumber, sortBy, sortDirection, prepareFilters, baseUserExludeFields);
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield users_collection_1.UserModel.findOne({ email }, { projection: baseUserExludeFields });
        });
    }
    findUserByLogin(login) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield users_collection_1.UserModel.findOne({ login }, { projection: baseUserExludeFields });
        });
    }
    findNoActUserByConfirmedCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield users_collection_1.UserModel.findOne({ 'confirmedInfo.code': code, 'confirmedInfo.isConfirmedEmail': false }, { projection: baseUserExludeFields });
        });
    }
    findById(id) {
        const _super = Object.create(null, {
            findById: { get: () => super.findById }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.findById.call(this, id, baseUserExludeFields);
        });
    }
}
exports.UsersQueryRepo = UsersQueryRepo;
exports.userMappersQuery = {
    authMe(user) {
        return {
            email: user.email,
            login: user.login,
            userId: user.id,
        };
    }
};
// @ts-ignore
exports.usersQueryRepo = new UsersQueryRepo(users_collection_1.UserModel);
