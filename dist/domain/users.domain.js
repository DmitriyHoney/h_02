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
exports.UserDomain = void 0;
const types_1 = require("../types/types");
class UserDomain {
    constructor(usersQueryRepo, usersCommandRepo) {
        this.usersQueryRepo = usersQueryRepo;
        this.usersCommandRepo = usersCommandRepo;
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
}
exports.UserDomain = UserDomain;
