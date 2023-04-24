"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const users_middleware_1 = require("../middlewares/users.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const users_controllers_1 = require("../controllers/users.controllers");
const composition_roots_1 = __importDefault(require("../composition-roots"));
const userControllers = composition_roots_1.default.resolve(users_controllers_1.UserControllers);
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, userControllers.getAll.bind(userControllers));
router.post('/', auth_middleware_1.authMiddleware, ...users_middleware_1.createUsersBody, middlewares_1.validatorsErrorsMiddleware, userControllers.create.bind(userControllers));
router.delete('/:id/', auth_middleware_1.authMiddleware, userControllers.delete.bind(userControllers));
exports.default = router;
