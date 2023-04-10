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
exports.UserDomain = void 0;
const users_repositry_1 = require("../repositries/users.repositry"); //usersQueryRepo, usersCommandRepo
const types_1 = require("../types/types");
const inversify_1 = require("inversify");
let UserDomain = class UserDomain {
    constructor(usersQueryRepo, usersCommandRepo) {
        this.usersQueryRepo = usersQueryRepo;
        this.usersCommandRepo = usersCommandRepo;
    }
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const isExistUserThisEmail = yield this.usersQueryRepo.findUserByEmail(body.email);
            if (isExistUserThisEmail)
                throw new Error(types_1.VALIDATION_ERROR_MSG.USER_THIS_EMAIL_EXIST);
            const isExistUserThisLogin = yield this.usersQueryRepo.findUserByLogin(body.login);
            if (isExistUserThisLogin)
                throw new Error(types_1.VALIDATION_ERROR_MSG.USER_THIS_LOGIN_EXIST);
            try {
                return yield this.usersCommandRepo.create(body);
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.usersCommandRepo.update(id, body);
        });
    }
    deleteOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.usersCommandRepo.delete(id);
        });
    }
    deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.usersCommandRepo._deleteAll();
        });
    }
};
UserDomain = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(users_repositry_1.UsersQueryRepo)),
    __param(1, (0, inversify_1.inject)(users_repositry_1.UsersCommandRepo)),
    __metadata("design:paramtypes", [users_repositry_1.UsersQueryRepo,
        users_repositry_1.UsersCommandRepo])
], UserDomain);
exports.UserDomain = UserDomain;
