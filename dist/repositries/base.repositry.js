"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.QueryRepo = exports.CommandRepo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const inversify_1 = require("inversify");
let CommandRepo = class CommandRepo {
    constructor(collection) {
        this.collection = collection;
    }
    // @ts-ignore
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.collection.create(payload);
            return res._id;
        });
    }
    update(_id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const result = yield this.collection.updateOne({ _id }, { $set: payload });
            return result.matchedCount === 1;
        });
    }
    delete(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.collection.deleteOne({ _id });
            return result.deletedCount === 1;
        });
    }
    _deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.collection.deleteMany();
            return result.deletedCount > 0;
        });
    }
    ;
};
CommandRepo = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [mongoose_1.default.Model])
], CommandRepo);
exports.CommandRepo = CommandRepo;
let QueryRepo = class QueryRepo {
    constructor(collection) {
        this.collection = collection;
    }
    // @ts-ignore
    find(pageSize = '10', pageNumber = '1', sortBy = 'createdAt', sortDirection = 'desc', filters = {}, excludeFields = {}, addFields = {}) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = +pageSize * (+pageNumber - 1);
                const payload = [
                    { $addFields: Object.assign({ id: "$_id" }, addFields) },
                    { $project: Object.assign(Object.assign({ _id: 0, __v: 0 }, excludeFields), { updatedAt: 0 }) },
                    {
                        $facet: {
                            items: [{ $skip: skip }, { $limit: +pageSize }],
                            totalCount: [{ $count: 'count' }]
                        }
                    }
                ];
                if (!['asc', 'desc'].includes(sortDirection))
                    sortDirection = 'asc';
                Object.values(filters).length ? payload.unshift({ '$match': filters }) : null;
                payload.unshift({ '$sort': { [sortBy]: sortDirection === 'asc' ? 1 : -1 } });
                const items = yield this.collection.aggregate(payload);
                const result = {
                    pagesCount: Math.ceil(+((_b = (_a = items[0]) === null || _a === void 0 ? void 0 : _a.totalCount[0]) === null || _b === void 0 ? void 0 : _b.count) / +pageSize) || 0,
                    page: +pageNumber,
                    pageSize: +pageSize,
                    totalCount: ((_d = (_c = items[0]) === null || _c === void 0 ? void 0 : _c.totalCount[0]) === null || _d === void 0 ? void 0 : _d.count) || 0,
                    items: (_e = items[0]) === null || _e === void 0 ? void 0 : _e.items,
                };
                return new Promise((resolve) => resolve(result));
            }
            catch (e) {
                return new Promise((resolve, reject) => reject(e));
            }
        });
    }
    findAll(filters = {}, excludeFields = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.collection.find(Object.assign({}, filters), Object.assign(Object.assign({}, excludeFields), { updatedAt: 0 }));
        });
    }
    findById(_id, excludeFields = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.collection.findOne({ _id }, Object.assign(Object.assign({}, excludeFields), { updatedAt: 0 }));
        });
    }
};
QueryRepo = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [mongoose_1.default.Model])
], QueryRepo);
exports.QueryRepo = QueryRepo;
