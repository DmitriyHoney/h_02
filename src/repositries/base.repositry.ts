import { WithId, Collection } from 'mongodb';
import mongoose, { IfAny, Document, Require_id } from 'mongoose';
import { PaginationSortingType } from '../types/types';

interface GenericRepoCommandLayerFn<Payload> {
    create: (payload: Payload) => Promise<string | number>
    update: (id: string, payload: Payload) => Promise<boolean>
    delete: (id: string) => Promise<boolean>
    _deleteAll: () => Promise<boolean>
}

export class CommandRepo<I, P> implements GenericRepoCommandLayerFn<P> {
    collection: mongoose.Model<I>;
    constructor(collection: mongoose.Model<I>) {
        this.collection = collection;
    }
    async create(payload: P) {
        const res = await this.collection.create(payload);
        return String(res.id);
    }
    async update(id: string, payload: P) {
        // @ts-ignore
        const result = await this.collection.updateOne({ id }, { $set: payload });
        return result.matchedCount === 1
    }
    async delete(id: string) {
        const result = await this.collection.deleteOne({ id });
        return result.deletedCount === 1;
    }
    async _deleteAll() {
        const result = await this.collection.deleteMany();
        return result.deletedCount > 0;
    };
}


interface GenericRepoQueryLayerFn<ItemType> {
    find: (
        pageSize: string, 
        pageNumber: string,
        sortBy: string,
        sortDirection: 'asc' | 'desc',
        filters: object,
    ) => Promise<PaginationSortingType<WithId<PaginationSortingType<ItemType> & Document>>>
    findAll: (
        filters?: object,
        excludeFields?: object,
    ) => Promise<IfAny<ItemType, any, Document<unknown, {}, ItemType> & Omit<Require_id<ItemType>, never>>[]>
    findById: (id: string, excludeFields: object) => Promise<IfAny<ItemType, any, Document<unknown, {}, ItemType> & Omit<Require_id<ItemType>, never>> | null>
}

type ReturnedQueryGetAll<I> = PaginationSortingType<WithId<PaginationSortingType<I> & Document>>;

export class QueryRepo<I> implements GenericRepoQueryLayerFn<I> {
    collection: mongoose.Model<I>;
    constructor(collection: mongoose.Model<I>) {
        this.collection = collection;
    }
    async find(
        pageSize: string = '10', 
        pageNumber: string = '1',
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc',
        filters: object = {},

        excludeFields: object = {},
    ) {
        const skip = +pageSize * (+pageNumber - 1);

        const payload: any = [
            { $project: { 'id': '$login', password: 0, ...excludeFields } },
            { 
                $facet: {
                    items: [{ $skip: skip }, { $limit: +pageSize }],
                    totalCount: [{ $count: 'count' }]
                } 
            }
        ];
        if (!['asc', 'desc'].includes(sortDirection)) sortDirection = 'asc';
        Object.values(filters).length ? payload.unshift({ '$match': filters }) : null;
        payload.unshift({ '$sort': { [sortBy]: sortDirection === 'asc' ? 1 : -1 } });
        const items = await this.collection.aggregate(payload);
        const result: ReturnedQueryGetAll<I> = {
            pagesCount: Math.ceil(+items[0]?.totalCount[0]?.count / +pageSize) || 0,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: items[0]?.totalCount[0]?.count || 0,
            items: items[0]?.items,
        };
        return new Promise((resolve: (value: ReturnedQueryGetAll<I>) => void) => resolve(result));
    }
    async findAll(filters: object = {}, excludeFields: object = {}) {
        return this.collection.find({ ...filters }, { projection: { _id: 0, password: 0, ...excludeFields } });
    }
    async findById(id: string, excludeFields: object = {}) {
        return await this.collection.findOne({ id }, { projection: { _id: 0, password: 0, ...excludeFields } })
    }
}