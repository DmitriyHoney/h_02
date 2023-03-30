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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryRepo = exports.CommandRepo = void 0;
class CommandRepo {
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
}
exports.CommandRepo = CommandRepo;
class QueryRepo {
    constructor(collection) {
        this.collection = collection;
    }
    find(pageSize = '10', pageNumber = '1', sortBy = 'createdAt', sortDirection = 'desc', filters = {}, excludeFields = {}, addFields = {}) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
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
}
exports.QueryRepo = QueryRepo;
