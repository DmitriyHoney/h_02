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
const pwd_repositry_1 = require("../repositries/pwd.repositry");
exports.default = {
    create: (body) => __awaiter(void 0, void 0, void 0, function* () {
        return yield pwd_repositry_1.pwdCommandRepo.create(body);
    }),
    update: (id, body) => __awaiter(void 0, void 0, void 0, function* () { return yield pwd_repositry_1.pwdCommandRepo.update(id, body); }),
    deleteOne: (id) => __awaiter(void 0, void 0, void 0, function* () { return yield pwd_repositry_1.pwdCommandRepo.delete(id); }),
    deleteAll: () => __awaiter(void 0, void 0, void 0, function* () { return yield pwd_repositry_1.pwdCommandRepo._deleteAll(); }),
    isCodeConfirmationValid: (date) => {
        const expiredDate = new Date(date);
        const curDate = new Date();
        const isDateNotExpired = curDate <= expiredDate;
        return isDateNotExpired;
    }
};
