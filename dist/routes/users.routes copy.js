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
const users_middleware_1 = require("../middlewares/users.middleware");
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const users_repositry_1 = require("../repositries/users.repositry");
const users_domain_1 = __importDefault(require("../domain/users.domain"));
const router = (0, express_1.Router)();
router.get('/', middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, pageNumber, sortBy, sortDirection, searchEmailTerm, searchLoginTerm } = req.query;
    const result = yield users_repositry_1.usersQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection, { searchEmailTerm, searchLoginTerm });
    res.send(result);
}));
router.post('/', middlewares_1.authMiddleware, ...users_middleware_1.createUsersBody, middlewares_1.validatorsErrorsMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = yield users_domain_1.default.create(req.body);
        const result = yield users_repositry_1.usersQueryRepo.findById(id);
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
}));
router.delete('/:id/', middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isDeleted = yield users_domain_1.default.deleteOne(req.params.id);
    return isDeleted
        ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
}));
exports.default = router;
