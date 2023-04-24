"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Routes
const blogs_routes_1 = __importDefault(require("./routes/blogs.routes"));
const posts_routes_1 = __importDefault(require("./routes/posts.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const comments_routes_1 = __importDefault(require("./routes/comments.routes"));
const activeDeviceSessions_routes_1 = __importDefault(require("./routes/activeDeviceSessions.routes"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.set('trust proxy', true);
app.use((req, res, next) => {
    console.log(req.method, req.url, req.body);
    next();
});
app.get('/', (req, res) => res.send('Hello, world!'));
app.use('/api/users', users_routes_1.default);
app.use('/api/blogs', blogs_routes_1.default);
app.use('/api/posts', posts_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/comments', comments_routes_1.default);
app.use('/api/security/devices', activeDeviceSessions_routes_1.default);
app.use('/api/testing/all-data', test_routes_1.default);
exports.default = app;
