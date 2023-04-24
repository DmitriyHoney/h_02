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
exports.secureToManyRequests = exports.getUserByRefreshJWT = exports.authCheckValidRefreshJWT = exports.authMiddlewareJWT = exports.authMiddleware = exports.authRegistrationResend = exports.authRegistrationConfirm = exports.authRegistration = exports.authBody = exports.newPassAuthBody = void 0;
const express_validator_1 = require("express-validator");
const types_1 = require("../types/types");
const jwt_service_1 = require("../helpers/jwt-service");
const users_repositry_1 = require("../repositries/users.repositry");
const helpers_1 = require("../helpers");
const users = {
    admin: 'qwerty',
};
exports.newPassAuthBody = [
    (0, express_validator_1.body)('recoveryCode')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail(),
    (0, express_validator_1.body)('newPassword')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 6, max: 20 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
];
exports.authBody = [
    (0, express_validator_1.body)('loginOrEmail')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail(),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 6, max: 20 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
];
exports.authRegistration = [
    (0, express_validator_1.body)('login')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 3, max: 11 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isLength({ min: 6, max: 20 }).withMessage(types_1.VALIDATION_ERROR_MSG.OUT_OF_RANGE),
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .custom((value) => {
        if (!(0, helpers_1.isEmail)(value))
            throw new Error(types_1.VALIDATION_ERROR_MSG.EMAIL_NOT_VALID_TEMPLATE);
        return true;
    }),
];
exports.authRegistrationConfirm = [
    (0, express_validator_1.body)('code')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail(),
];
exports.authRegistrationResend = [
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .isString().withMessage(types_1.VALIDATION_ERROR_MSG.IS_STRING).bail()
        .trim()
        .notEmpty().withMessage(types_1.VALIDATION_ERROR_MSG.REQUIRED).bail()
        .custom((value) => {
        if (!(0, helpers_1.isEmail)(value))
            throw new Error(types_1.VALIDATION_ERROR_MSG.EMAIL_NOT_VALID_TEMPLATE);
        return true;
    }),
];
// первоначальная basic проверка
const authMiddleware = (req, res, next) => {
    var _a, _b;
    if (!((_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization))
        return res.status(types_1.HTTP_STATUSES.NOT_AUTHORIZED_401).send('Not authorized');
    const [prefix, authInfo] = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(' ');
    if (prefix.trim() !== 'Basic')
        return res.status(types_1.HTTP_STATUSES.NOT_AUTHORIZED_401).send('Not authorized');
    const [login, pwd] = Buffer.from(authInfo, 'base64').toString().split(':');
    // @ts-ignore
    if (users[login] === pwd && login && pwd) {
        next();
    }
    else {
        return res.status(types_1.HTTP_STATUSES.NOT_AUTHORIZED_401).send('Not authorized');
    }
};
exports.authMiddleware = authMiddleware;
// продвинутая jwt проверка
const authMiddlewareJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!req.headers.authorization) {
        if ((_a = req === null || req === void 0 ? void 0 : req.context) === null || _a === void 0 ? void 0 : _a.user)
            req.context.user = null;
        return res.status(types_1.HTTP_STATUSES.NOT_AUTHORIZED_401).send();
    }
    const token = req.headers.authorization.split(' ')[1];
    const payload = jwt_service_1.jwtService.verifyToken(token);
    if (payload) {
        if (!req.context)
            req.context = { user: null, verifiedToken: null, userIP: undefined };
        // @ts-ignore
        req.context.user = yield users_repositry_1.usersQueryRepo.findById(payload.userId);
        if (!req.context.user) {
            req.context.user = null;
            return res.status(types_1.HTTP_STATUSES.NOT_AUTHORIZED_401).send();
        }
        // @ts-ignore
        console.log(555, payload.userId, req.context.user);
        // req.context.deviceId = await usersQueryRepo.findById(payload.deviceId);
        next();
    }
    else {
        if ((_b = req === null || req === void 0 ? void 0 : req.context) === null || _b === void 0 ? void 0 : _b.user)
            req.context.user = null;
        return res.status(types_1.HTTP_STATUSES.NOT_AUTHORIZED_401).send();
    }
});
exports.authMiddlewareJWT = authMiddlewareJWT;
const authCheckValidRefreshJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const refreshToken = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.refreshToken;
    if (!refreshToken)
        return res.status(types_1.HTTP_STATUSES.NOT_AUTHORIZED_401).send();
    const verifiedToken = jwt_service_1.jwtService.verifyToken(refreshToken);
    if (!verifiedToken)
        return res.status(types_1.HTTP_STATUSES.NOT_AUTHORIZED_401).send();
    const ip = (0, helpers_1.getUserIp)(req);
    if (!ip)
        return res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send();
    if (!req.context)
        req.context = { user: null, verifiedToken: null, userIP: undefined };
    req.context.userIP = ip;
    // @ts-ignore
    req.context.user = yield users_repositry_1.usersQueryRepo.findById(verifiedToken.userId);
    // @ts-ignore
    req.context.verifiedToken = verifiedToken;
    next();
});
exports.authCheckValidRefreshJWT = authCheckValidRefreshJWT;
const getUserByRefreshJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const refreshToken = (_d = req.cookies) === null || _d === void 0 ? void 0 : _d.refreshToken;
    if (!refreshToken && ((_e = req.headers) === null || _e === void 0 ? void 0 : _e.authorization)) {
        // @ts-ignore
        const token = req.headers.authorization.split(' ')[1];
        const payload = jwt_service_1.jwtService.verifyToken(token);
        if (payload) {
            if (!req.context)
                req.context = { user: null, verifiedToken: null, userIP: undefined };
            // @ts-ignore
            req.context.user = yield users_repositry_1.usersQueryRepo.findById(payload.userId);
            // req.context.deviceId = await usersQueryRepo.findById(payload.deviceId);
        }
        return next();
    }
    console.log(1111111, req.cookies.refreshToken);
    const verifiedToken = jwt_service_1.jwtService.verifyToken(refreshToken);
    if (!verifiedToken)
        return next();
    if (!req.context)
        req.context = { user: null, verifiedToken: null, userIP: undefined };
    // @ts-ignore
    req.context.user = yield users_repositry_1.usersQueryRepo.findById(verifiedToken.userId);
    next();
});
exports.getUserByRefreshJWT = getUserByRefreshJWT;
const tempMethodsCount = {};
// TODO: перенести хранение подсчёта кол-ва запросов в базу
const secureToManyRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ip = (0, helpers_1.getUserIp)(req);
    const { url, method } = req;
    const key = `${ip} ${method} ${url}`;
    const initMeta = () => {
        tempMethodsCount[key] = {
            count: 1,
            blockedDate: (0, helpers_1.generateExpiredDate)({ hours: 0, min: 0, sec: 10 }).toISOString(),
            updatedAt: new Date().toISOString()
        };
    };
    if (!tempMethodsCount[key]) {
        initMeta();
        next();
        return;
    }
    ;
    tempMethodsCount[key].count++;
    if (isReqLastDateIsOut()) {
        initMeta();
        next();
        return;
    }
    ;
    tempMethodsCount[key].updatedAt = new Date().toISOString();
    tempMethodsCount[key].blockedDate = (0, helpers_1.generateExpiredDate)({ hours: 0, min: 0, sec: 10 }).toISOString();
    if (tempMethodsCount[key].count > 5) {
        const curDate = new Date();
        const lastMethodReqDate = new Date(tempMethodsCount[key].blockedDate);
        if (curDate < lastMethodReqDate)
            return res.status(types_1.HTTP_STATUSES.TOO_MANY_REQUESTS_429).send();
        delete tempMethodsCount[key];
    }
    next();
    function isReqLastDateIsOut() {
        const lastUpd = new Date(tempMethodsCount[key].updatedAt);
        const curDate = new Date();
        // @ts-ignore
        const diffSec = Math.abs(curDate - lastUpd) / 1000;
        return diffSec > 10;
    }
});
exports.secureToManyRequests = secureToManyRequests;
