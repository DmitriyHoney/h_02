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
exports.deviceActiveSessionsQueryRepo = exports.deviceActiveSessionsCommandRepo = void 0;
const base_repositry_1 = require("./base.repositry");
const sessions_collection_1 = require("../db/collections/sessions.collection");
class DeviceActiveSessionsCommandRepo extends base_repositry_1.CommandRepo {
    deleteAllByUserId(userId, excludeItemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield sessions_collection_1.SessionModel.deleteMany({ _userId: userId, id: { $ne: excludeItemId } });
            return result.deletedCount > 0;
        });
    }
}
// @ts-ignore
exports.deviceActiveSessionsCommandRepo = new DeviceActiveSessionsCommandRepo(sessions_collection_1.SessionModel);
class DeviceActiveSessionsQueryRepo extends base_repositry_1.QueryRepo {
    findByIpAndDeviceId(ip, deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield sessions_collection_1.SessionModel.findOne({ ip, deviceId }, { projection: { _id: 0 } });
        });
    }
    findByDeviceId(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield sessions_collection_1.SessionModel.findOne({ deviceId }, { projection: { _id: 0 } });
        });
    }
    findAllByCurrentUser(userId) {
        const _super = Object.create(null, {
            findAll: { get: () => super.findAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.findAll.call(this, { _userId: userId }, { _expirationDate: 0, _userId: 0, id: 0, createdAt: 0 });
        });
    }
}
// @ts-ignore
exports.deviceActiveSessionsQueryRepo = new DeviceActiveSessionsQueryRepo(sessions_collection_1.SessionModel);
