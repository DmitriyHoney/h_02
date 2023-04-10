"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
const inversify_1 = require("inversify");
let UsersCommandRepo = class UsersCommandRepo extends base_repositry_1.CommandRepo {
    constructor(collection) {
        super(collection);
    }
};
UsersCommandRepo = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(users_collection_1.UserModel)),
    __param(0, (0, inversify_1.named)("master2")),
    __metadata("design:paramtypes", [Object])
], UsersCommandRepo);
exports.UsersCommandRepo = UsersCommandRepo;
// @ts-ignore
exports.usersCommandRepo = new UsersCommandRepo(users_collection_1.UserModel);
const baseUserExludeFields = {
    confirmedInfo: 0,
    password: 0,
    updatedAt: 0,
};
let UsersQueryRepo = class UsersQueryRepo extends base_repositry_1.QueryRepo {
    constructor(collection) {
        super(collection);
    }
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
            return yield this.collection.findOne({ email }, { projection: baseUserExludeFields });
        });
    }
    findUserByLogin(login) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.collection.findOne({ login }, { projection: baseUserExludeFields });
        });
    }
    findNoActUserByConfirmedCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.collection.findOne({ 'confirmedInfo.code': code, 'confirmedInfo.isConfirmedEmail': false }, { projection: baseUserExludeFields });
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
};
UsersQueryRepo = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(users_collection_1.UserModel)),
    __param(0, (0, inversify_1.named)("master")),
    __metadata("design:paramtypes", [Object])
], UsersQueryRepo);
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
