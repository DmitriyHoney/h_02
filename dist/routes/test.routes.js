"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogs_domain_1 = __importDefault(require("../domain/blogs.domain"));
const posts_domain_1 = __importDefault(require("../domain/posts.domain"));
const activeDeviceSessions_domain_1 = __importDefault(require("../domain/activeDeviceSessions.domain"));
const types_1 = require("../types/types");
const comments_controllers_1 = require("../controllers/comments.controllers");
const composition_roots_1 = __importDefault(require("../composition-roots"));
const users_domain_1 = require("../domain/users.domain");
const router = (0, express_1.Router)();
const userDomain = composition_roots_1.default.resolve(users_domain_1.UserDomain);
router.delete('/', (req, res) => {
    Promise.all([
        blogs_domain_1.default.deleteAll(),
        posts_domain_1.default.deleteAll(),
        userDomain.deleteAll(),
        comments_controllers_1.commentsDomain.deleteAll(),
        activeDeviceSessions_domain_1.default.deleteAll(),
    ]).then((result) => {
        res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send();
    }).catch((err) => {
        console.error(err);
        res.status(types_1.HTTP_STATUSES.SERVER_ERROR_500).send();
    });
});
exports.default = router;
