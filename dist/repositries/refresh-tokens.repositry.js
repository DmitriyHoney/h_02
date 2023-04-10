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
exports.refreshTokensQueryRepo = exports.refreshTokensCommandRepo = void 0;
const base_repositry_1 = require("./base.repositry");
const db_1 = require("../db");
class RefreshTokensCommandRepo extends base_repositry_1.CommandRepo {
}
exports.refreshTokensCommandRepo = new RefreshTokensCommandRepo('refresh_tokens');
class RefreshTokensQueryRepo extends base_repositry_1.QueryRepo {
    findByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.collection)(this.collectionName).findOne({ token }, { projection: { _id: 0 } });
        });
    }
}
exports.refreshTokensQueryRepo = new RefreshTokensQueryRepo('refresh_tokens');
