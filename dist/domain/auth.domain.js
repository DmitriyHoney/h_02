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
const helpers_1 = require("../helpers");
const users_repositry_1 = require("../repositries/users.repositry");
const types_1 = require("../types/types");
exports.default = {
    _login: (body) => __awaiter(void 0, void 0, void 0, function* () {
        const { loginOrEmail, password } = body;
        const findMethod = (0, helpers_1.isEmail)(loginOrEmail)
            ? users_repositry_1.usersQueryRepo.findUserByEmail.bind(users_repositry_1.usersQueryRepo)
            : users_repositry_1.usersQueryRepo.findUserByLogin.bind(users_repositry_1.usersQueryRepo);
        const user = yield findMethod(loginOrEmail);
        if (!user)
            throw new Error(types_1.VALIDATION_ERROR_MSG.EMAIL_OR_PASSWORD_NOT_VALID);
        // @ts-ignore
        const isPasswordValid = yield (0, helpers_1.comparePasswords)(password, user.password);
        return isPasswordValid ? user : null;
    }),
    get login() {
        return this._login;
    },
    set login(value) {
        this._login = value;
    },
    isCodeConfirmationValid: (code, user) => {
        var _a, _b;
        // @ts-ignore
        const expiredDate = new Date((_a = user.confirmedInfo) === null || _a === void 0 ? void 0 : _a.codeExpired);
        const curDate = new Date();
        const isCodesEqual = code === ((_b = user.confirmedInfo) === null || _b === void 0 ? void 0 : _b.code);
        const isDateNotExpired = curDate <= expiredDate;
        return isCodesEqual || isDateNotExpired;
    }
};
