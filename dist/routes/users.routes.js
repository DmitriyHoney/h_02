"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const users_middleware_1 = require("../middlewares/users.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const users_controllers_1 = require("../controllers/users.controllers");
const router = (0, express_1.Router)();
router.get('/ttt', (req, res) => {
    res.status(200).send("wow");
});
router.get('/', auth_middleware_1.authMiddleware, users_controllers_1.userControllers.getAll.bind(users_controllers_1.userControllers));
router.post('/', auth_middleware_1.authMiddleware, ...users_middleware_1.createUsersBody, middlewares_1.validatorsErrorsMiddleware, users_controllers_1.userControllers.create.bind(users_controllers_1.userControllers));
router.delete('/:id/', auth_middleware_1.authMiddleware, users_controllers_1.userControllers.delete.bind(users_controllers_1.userControllers));
exports.default = router;
