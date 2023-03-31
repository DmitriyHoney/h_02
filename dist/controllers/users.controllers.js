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
exports.userControllers = exports.userDomain = void 0;
const users_domain_1 = require("../domain/users.domain");
const types_1 = require("../types/types");
const users_repositry_1 = require("../repositries/users.repositry");
class UserControllers {
    constructor(usersDomain) {
        this.usersDomain = usersDomain;
        this.usersDomain = usersDomain;
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { pageSize, pageNumber, sortBy, sortDirection, searchEmailTerm, searchLoginTerm } = req.query;
                const result = yield this.usersDomain.usersQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection, { searchEmailTerm, searchLoginTerm });
                res.send(result);
            }
            catch (e) {
                console.log(11111, e);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = yield this.usersDomain.create(req.body);
                // @ts-ignore
                const result = yield this.usersDomain.usersQueryRepo.findById(id);
                res.status(types_1.HTTP_STATUSES.CREATED_201).send(result);
            }
            catch (e) {
                const userExistErrors = [types_1.VALIDATION_ERROR_MSG.USER_THIS_EMAIL_EXIST, types_1.VALIDATION_ERROR_MSG.USER_THIS_LOGIN_EXIST];
                const errMsg = e.message;
                if (userExistErrors.includes(errMsg)) {
                    const errorField = errMsg.indexOf('login') >= 0 ? 'login' : 'email';
                    const resultErrors = {
                        errorsMessages: [
                            { field: errorField, message: errMsg }
                        ]
                    };
                    res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send(resultErrors);
                }
                else {
                    res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send(errMsg);
                }
            }
        });
    }
    ;
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const isDeleted = yield this.usersDomain.deleteOne(req.params.id);
            return isDeleted
                ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
                : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        });
    }
    ;
}
exports.userDomain = new users_domain_1.UserDomain(users_repositry_1.usersQueryRepo, users_repositry_1.usersCommandRepo);
exports.userControllers = new UserControllers(exports.userDomain);
