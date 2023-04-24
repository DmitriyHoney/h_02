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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const helpers_1 = require("../../helpers");
const { Schema } = mongoose_1.default;
// @ts-ignore
const userSchema = new Schema({
    login: String,
    email: String,
    password: String,
    confirmedInfo: {
        isConfirmedEmail: { type: Boolean, default: false },
        code: { type: String, default: '' },
        codeExpired: { type: String, default: '' },
    }
}, { timestamps: true });
userSchema.method('toJSON', function () {
    const _a = this.toObject(), { __v, _id } = _a, object = __rest(_a, ["__v", "_id"]);
    object.id = _id;
    delete object._id;
    delete object.__v;
    return object;
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isNew && !this.isModified('password'))
            return next();
        try {
            // @ts-ignore
            const hash = yield (0, helpers_1.hashPassword)(this.password);
            this.password = hash;
            return next();
        }
        catch (_a) {
            return next();
        }
    });
});
exports.UserModel = mongoose_1.default.model('User', userSchema);
