"use strict";
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
exports.BlogModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const helpers_1 = require("../../helpers");
const types_1 = require("../../types/types");
const { Schema } = mongoose_1.default;
// @ts-ignore
const blogSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 15,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 500,
    },
    websiteUrl: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 100,
        validate: {
            validator: function (v) {
                return (0, helpers_1.isUrl)(v);
            },
            message: () => types_1.VALIDATION_ERROR_MSG.IS_URL
        },
    },
    isMembership: {
        type: Boolean,
        required: false,
        default: false,
    }
}, { timestamps: true });
blogSchema.method('toJSON', function () {
    const _a = this.toObject(), { __v, _id } = _a, object = __rest(_a, ["__v", "_id"]);
    object.id = _id;
    delete object._id;
    delete object.__v;
    return object;
});
exports.BlogModel = mongoose_1.default.model('Blog', blogSchema);
