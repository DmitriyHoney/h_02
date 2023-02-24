import { Document, WithId, Collection } from 'mongodb';
import { collection } from '../db'
import { PaginationSortingType } from '../types/types';

interface GenericRepoCommandLayerFn<Payload> {
    create: (payload: Payload) => Promise<string>
    update: (id: string, payload: Payload) => Promise<boolean>
    delete: (id: string) => Promise<boolean>
    _deleteAll: () => Promise<boolean>
}

export class CommandRepo<I, P> implements GenericRepoCommandLayerFn<P> {
    collectionName: string;
    constructor(collectionName: string) {
        this.collectionName = collectionName;
    }
    async create(payload: P) {
        const curDate = new Date();
        const newItem = { id: String(curDate.getTime()), createdAt: curDate.toISOString(), ...payload };
        // @ts-ignore
        await collection<I>(this.collectionName).insertOne(newItem);
        return String(curDate.getTime())
    }
    async update(id: string, payload: P) {
        // @ts-ignore
        const result = await collection<I>(this.collectionName).updateOne({ id }, { $set: payload });
        return result.matchedCount === 1
    }
    async delete(id: string) {
        // @ts-ignore
        const result = await collection<I>(this.collectionName).deleteOne({ id });
        return result.deletedCount === 1;
    }
    async _deleteAll() {
        const result = await collection<I>(this.collectionName).deleteMany();
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
    findById: (id: string) => Promise<WithId<ItemType & Document> | null>
}

type ReturnedQueryGetAll<I> = PaginationSortingType<WithId<PaginationSortingType<I> & Document>>;

export class QueryRepo<I> implements GenericRepoQueryLayerFn<I> {
    collectionName: string;
    constructor(collectionName: string) {
        this.collectionName = collectionName;
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
            { $project: { _id: 0, password: 0, ...excludeFields } },
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
        const items = await collection<I>(this.collectionName).aggregate(payload).toArray();
        const result: ReturnedQueryGetAll<I> = {
            pagesCount: Math.ceil(+items[0]?.totalCount[0]?.count / +pageSize) || 0,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: items[0]?.totalCount[0]?.count || 0,
            items: items[0]?.items,
        };
        return new Promise((resolve: (value: ReturnedQueryGetAll<I>) => void) => resolve(result));
    }
    async findById(id: string) {
        // @ts-ignore
        return await collection<I>(this.collectionName).findOne({ id }, { projection: { _id: 0, password: 0 } })
    }
}