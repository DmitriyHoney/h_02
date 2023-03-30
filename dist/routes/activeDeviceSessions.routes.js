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
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const activeDeviceSessions_repositry_1 = require("../repositries/activeDeviceSessions.repositry");
const types_1 = require("../types/types");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authCheckValidRefreshJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { verifiedToken } = req.context;
    const result = yield activeDeviceSessions_repositry_1.deviceActiveSessionsQueryRepo.findAllByCurrentUser(
    // @ts-ignore
    verifiedToken === null || verifiedToken === void 0 ? void 0 : verifiedToken.userId);
    res.send(result);
}));
router.delete('/:deviceId', auth_middleware_1.authCheckValidRefreshJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // @ts-ignore
    const findRow = yield activeDeviceSessions_repositry_1.deviceActiveSessionsQueryRepo.findByDeviceId(req.params.deviceId);
    if (!findRow)
        return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
    // @ts-ignore
    if (findRow._userId !== ((_a = req.context.verifiedToken) === null || _a === void 0 ? void 0 : _a.userId))
        return res.status(types_1.HTTP_STATUSES.FORBIDDEN_403).send();
    const result = yield activeDeviceSessions_repositry_1.deviceActiveSessionsCommandRepo.delete(findRow.id);
    if (!result)
        return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
    res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send();
}));
router.delete('/', auth_middleware_1.authCheckValidRefreshJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    // exclude current 
    // @ts-ignore
    const tokenItem = yield activeDeviceSessions_repositry_1.deviceActiveSessionsQueryRepo.findByIpAndDeviceId(req.context.userIP, (_b = req.context.verifiedToken) === null || _b === void 0 ? void 0 : _b.deviceId);
    // @ts-ignore
    const result = yield activeDeviceSessions_repositry_1.deviceActiveSessionsCommandRepo.deleteAllByUserId((_c = req.context.verifiedToken) === null || _c === void 0 ? void 0 : _c.userId, tokenItem.id);
    if (!result)
        return res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
    res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send();
}));
exports.default = router;
