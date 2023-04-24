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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const auth_domain_1 = __importDefault(require("../domain/auth.domain"));
const jwt_service_1 = require("../helpers/jwt-service");
const users_repositry_1 = require("../repositries/users.repositry");
const email_manager_1 = require("../managers/email.manager");
const helpers_1 = require("../helpers");
const activeDeviceSessions_domain_1 = __importDefault(require("../domain/activeDeviceSessions.domain"));
const activeDeviceSessions_repositry_1 = require("../repositries/activeDeviceSessions.repositry");
const pwd_domain_1 = __importDefault(require("../domain/pwd.domain"));
const pwd_repositry_1 = require("../repositries/pwd.repositry");
const composition_roots_1 = __importDefault(require("../composition-roots"));
const users_domain_1 = require("../domain/users.domain");
const userDomain = composition_roots_1.default.resolve(users_domain_1.UserDomain);
const router = (0, express_1.Router)();
router.post('/registration', ...auth_middleware_1.authRegistration, auth_middleware_1.secureToManyRequests, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const confirmedInfo = {
        code: (0, helpers_1.generateUUID)(), codeExpired: (0, helpers_1.generateExpiredDate)({ hours: 1, min: 0, sec: 0 }).toISOString(), isConfirmedEmail: false
    };
    try {
        yield userDomain.create(Object.assign(Object.assign({}, req.body), { confirmedInfo }));
        yield email_manager_1.emailManager.sendRegCodeConfirm(req.body.email, confirmedInfo.code);
        res.status(204).send();
    }
    catch (e) {
        const notUserThisEmailOrLogin = [types_1.VALIDATION_ERROR_MSG.USER_THIS_EMAIL_EXIST, types_1.VALIDATION_ERROR_MSG.USER_THIS_LOGIN_EXIST];
        const errMsg = e.message;
        return notUserThisEmailOrLogin.includes(errMsg)
            ? res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send({
                errorsMessages: [{ field: errMsg.indexOf('login') >= 0 ? 'login' : 'email', message: errMsg }]
            })
            : res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send(errMsg);
    }
}));
router.post('/password-recovery', ...auth_middleware_1.authRegistrationResend, auth_middleware_1.secureToManyRequests, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const confirmedInfo = {
        code: (0, helpers_1.generateUUID)(), expiredDate: (0, helpers_1.generateExpiredDate)({ hours: 1, min: 0, sec: 0 }).toISOString(), email: req.body.email, isActive: false,
    };
    try {
        pwd_domain_1.default.create(confirmedInfo);
        yield email_manager_1.emailManager.sendRecoverPassCodeConfirm(req.body.email, confirmedInfo.code);
        res.status(204).send();
    }
    catch (e) {
        return res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send({});
    }
}));
router.post('/new-password', ...auth_middleware_1.newPassAuthBody, auth_middleware_1.secureToManyRequests, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const codeInDb = yield pwd_repositry_1.pwdQueryRepo.findByCode(req.body.recoveryCode);
        if (!codeInDb) {
            return res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send({
                errorsMessages: [
                    { field: 'recoveryCode', message: 'Incorrect recoveryCode' }
                ]
            });
        }
        if (codeInDb.isActive) {
            return res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send({
                errorsMessages: [
                    { field: 'recoveryCode', message: 'Code already in use' }
                ]
            });
        }
        const isCodeValid = pwd_domain_1.default.isCodeConfirmationValid(codeInDb.expiredDate);
        if (!isCodeValid) {
            return res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send({
                errorsMessages: [
                    { field: 'recoveryCode', message: 'RecoveryCode is expired' }
                ]
            });
        }
        const user = yield users_repositry_1.usersQueryRepo.findUserByEmail(codeInDb.email);
        const password = yield (0, helpers_1.hashPassword)(req.body.newPassword);
        const userUpdated = { password };
        // @ts-ignore
        yield usersDomain.update(user === null || user === void 0 ? void 0 : user.id, userUpdated);
        yield pwd_repositry_1.pwdCommandRepo.update(codeInDb.id, Object.assign(Object.assign({}, codeInDb), { isActive: true }));
        return res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send({});
    }
    catch (e) {
        return res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send({});
    }
}));
router.post('/password-recovery', ...auth_middleware_1.authRegistrationResend, auth_middleware_1.secureToManyRequests, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = (0, helpers_1.generateUUID)();
    try {
        yield email_manager_1.emailManager.sendRecoverPassCodeConfirm(req.body.email, code);
        res.status(204).send();
    }
    catch (e) {
        return res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send({});
    }
}));
router.post('/registration-confirmation', ...auth_middleware_1.authRegistrationConfirm, auth_middleware_1.secureToManyRequests, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const errorsCodeAlreadyActivatedOrExpired = {
        errorsMessages: [{ message: 'Code already activated or expired', field: 'code' }],
    };
    const errorsCodeNotValid = {
        errorsMessages: [{ message: 'Code not valid', field: 'code' }],
    };
    const user = yield users_repositry_1.usersQueryRepo.findNoActUserByConfirmedCode(req.body.code);
    if (!user || ((_a = user.confirmedInfo) === null || _a === void 0 ? void 0 : _a.isConfirmedEmail))
        return res.status(400).send(errorsCodeAlreadyActivatedOrExpired);
    // @ts-ignore
    const isCodeValid = auth_domain_1.default.isCodeConfirmationValid(req.body.code, user);
    if (!isCodeValid)
        return res.status(400).send(errorsCodeNotValid);
    // @ts-ignore
    const isWasUpdated = yield usersDomain.update(user.id, Object.assign(Object.assign({}, user), { confirmedInfo: { code: '', codeExpired: '', isConfirmedEmail: true } }));
    return isWasUpdated ? res.status(204).send() : res.status(400).send();
}));
router.post('/registration-email-resending', ...auth_middleware_1.authRegistrationResend, auth_middleware_1.secureToManyRequests, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const expiredDate = new Date();
    expiredDate.setHours(expiredDate.getHours() + 1);
    const user = yield users_repositry_1.usersQueryRepo.findUserByEmail(req.body.email);
    if (!user)
        return res.status(400).send({
            errorsMessages: [{ message: 'User this email not found', field: 'email' }],
        });
    const errorsEmailAlreadyConfirmed = {
        errorsMessages: [{ message: 'Email already confirmed', field: 'email' }],
    };
    if ((_b = user.confirmedInfo) === null || _b === void 0 ? void 0 : _b.isConfirmedEmail)
        return res.status(400).send(errorsEmailAlreadyConfirmed);
    try {
        const confirmedCode = (0, helpers_1.generateUUID)();
        // @ts-ignore
        yield usersDomain.update(user.id, Object.assign(Object.assign({}, user), { confirmedInfo: {
                code: confirmedCode,
                codeExpired: expiredDate.toISOString(),
                isConfirmedEmail: false,
            } }));
        const info = yield email_manager_1.emailManager.sendRegCodeConfirm(req.body.email, confirmedCode);
        res.status(204).send();
    }
    catch (e) {
        res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send();
    }
}));
router.post('/login', ...auth_middleware_1.authBody, auth_middleware_1.secureToManyRequests, middlewares_1.validatorsErrorsMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield auth_domain_1.default.login(req.body);
        if (!user)
            return res.status(types_1.HTTP_STATUSES.NOT_AUTHORIZED_401).send();
        const deviceId = (0, helpers_1.generateUUID)();
        // @ts-ignore
        const accessToken = jwt_service_1.jwtService.createJWT(user, '30m');
        // @ts-ignore
        const refreshToken = jwt_service_1.jwtService.createJWT(user, '60m', deviceId);
        const ip = (0, helpers_1.getUserIp)(req);
        if (!ip)
            return res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send();
        yield activeDeviceSessions_domain_1.default.create({
            ip,
            title: req.get('User-Agent') || 'user agent unknown',
            lastActiveDate: new Date().toISOString(),
            deviceId,
            _expirationDate: (0, helpers_1.generateExpiredDate)({ hours: 1, min: 0, sec: 0 }).toISOString(),
            _userId: user.id,
        });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        res.status(types_1.HTTP_STATUSES.OK_200).send({ accessToken });
    }
    catch (e) {
        if (e.message === types_1.VALIDATION_ERROR_MSG.EMAIL_OR_PASSWORD_NOT_VALID) {
            res.status(types_1.HTTP_STATUSES.NOT_AUTHORIZED_401).send();
        }
        else
            res.status(types_1.HTTP_STATUSES.BAD_REQUEST_400).send();
    }
}));
router.post('/logout', auth_middleware_1.authCheckValidRefreshJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userIP, verifiedToken } = req.context;
    // @ts-ignore
    const tokenItem = yield activeDeviceSessions_repositry_1.deviceActiveSessionsQueryRepo.findByIpAndDeviceId(userIP, verifiedToken === null || verifiedToken === void 0 ? void 0 : verifiedToken.deviceId);
    if (!tokenItem)
        return res.status(401).send();
    // @ts-ignore
    const isDel = yield activeDeviceSessions_domain_1.default.deleteOne(tokenItem.id);
    if (!isDel)
        return res.status(401).send();
    return res.status(204).send();
}));
router.post('/refresh-token', auth_middleware_1.authCheckValidRefreshJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { userIP, verifiedToken } = req.context;
    // @ts-ignore
    const tokenItem = yield activeDeviceSessions_repositry_1.deviceActiveSessionsQueryRepo.findByIpAndDeviceId(userIP, verifiedToken === null || verifiedToken === void 0 ? void 0 : verifiedToken.deviceId);
    if (!tokenItem)
        return res.status(401).send();
    // @ts-ignore
    const user = yield users_repositry_1.usersQueryRepo.findById((_c = req.context.verifiedToken) === null || _c === void 0 ? void 0 : _c.userId);
    if (!user)
        return res.status(401).send();
    console.log('tokenItem', tokenItem);
    // @ts-ignore
    yield activeDeviceSessions_domain_1.default.update(tokenItem.id, Object.assign(Object.assign({}, tokenItem), { lastActiveDate: new Date().toISOString(), _expirationDate: (0, helpers_1.generateExpiredDate)({ hours: 1, min: 0, sec: 0 }).toISOString() }));
    const newAccessToken = jwt_service_1.jwtService.createJWT(user, '30m');
    // @ts-ignore
    const newRefreshToken = jwt_service_1.jwtService.createJWT(user, '60m', tokenItem.deviceId);
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
    res.status(types_1.HTTP_STATUSES.OK_200).send({ accessToken: newAccessToken });
}));
router.get('/me', auth_middleware_1.authMiddlewareJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    if (!((_d = req.context) === null || _d === void 0 ? void 0 : _d.user))
        return res.status(401).send();
    // @ts-ignore
    res.status(200).send(users_repositry_1.userMappersQuery.authMe(req.context.user));
}));
exports.default = router;
