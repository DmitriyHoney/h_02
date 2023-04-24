"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const settings_1 = require("../settings/");
exports.jwtService = {
    createJWT(user, expiresIn, deviceId) {
        // @ts-ignore
        return jsonwebtoken_1.default.sign({ userId: user.id, deviceId }, settings_1.settings.JWT_SECRET, { expiresIn });
    },
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, settings_1.settings.JWT_SECRET);
        }
        catch (e) {
            return null;
        }
    },
};
