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
const types_1 = require("../types/types");
const blogs_repositry_1 = __importDefault(require("../repositries/blogs.repositry"));
exports.default = {
    getAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield blogs_repositry_1.default.find();
        res.send(result);
    }),
    getOne: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const item = yield blogs_repositry_1.default.findById(req.params.id);
        if (!item) {
            res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
            return;
        }
        res.status(types_1.HTTP_STATUSES.OK_200).send(item);
    }),
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const item = yield blogs_repositry_1.default.create(Object.assign(Object.assign({}, req.body), { isMembership: false }));
        res.status(types_1.HTTP_STATUSES.CREATED_201).send(item);
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const isUpdated = yield blogs_repositry_1.default.update(req.params.id, req.body);
        return isUpdated
            ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send();
    }),
    deleteOne: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const isDeleted = yield blogs_repositry_1.default.delete(req.params.id);
        return isDeleted
            ? res.status(types_1.HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(types_1.HTTP_STATUSES.NOT_FOUND_404).send('Not found');
    }),
    deleteAll: (req, res) => blogs_repositry_1.default._deleteAll()
};
