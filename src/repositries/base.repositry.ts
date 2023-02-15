import { Document, WithId } from 'mongodb';
import { collection } from '../db'
import { PaginationSortingType } from '../types/types';

interface GenericRepoCommandLayerFn<Payload> {
    create: (payload: Payload) => Promise<string>
    update: (id: string, payload: Payload) => Promise<boolean>
    delete: (id: string) => Promise<boolean>
    _deleteAll: () => Promise<boolean>
}

interface GenericRepoQueryLayerFn<ItemType> {
    find: (pageNumber: string, pageSize: string) => Promise<WithId<PaginationSortingType<ItemType> & Document>[]>
    findById: (id: string) => Promise<WithId<ItemType & Document> | null>
}

export function generateBaseCommandRepo<I, P, C>(collectionName: string, custom: C): GenericRepoCommandLayerFn<P> & C {
    return {
        create: async (payload: P) => {
            const curDate = new Date();
            // @ts-ignore
            await collection<I>(collectionName).insertOne({ 
                id: String(curDate.getTime()),
                createdAt: curDate.toISOString(),
                ...payload 
            });
            return String(curDate.getTime())
        },
        update: async (id: string, payload: P) => {
            // @ts-ignore
            const result = await collection<I>(collectionName).updateOne({ id }, { $set: payload });
            return result.matchedCount === 1
        },
        delete: async (id: string) => {
            // @ts-ignore
            const result = await collection<I>(collectionName).deleteOne({ id });
            return result.deletedCount === 1;
        },
        _deleteAll: async () => {
            const result = await collection<I>(collectionName).deleteMany();
            return result.deletedCount > 0;
        },
        ...custom
    };
}

// по умолчанию возвращается весь объект кроме _id
export function generateBaseQueryRepo<I, C>(collectionName: string, custom: C): GenericRepoQueryLayerFn<I> & C {
    return {
        find: async (pageNumber: string = '1', pageSize: string = '10') => {
            const totalCount = await collection(collectionName).countDocuments();
            const skip = +pageSize * (+pageNumber - 1);
            const items = await collection<PaginationSortingType<I>>(collectionName)
                .aggregate([
                    { $skip: skip },
                    { $limit: +pageSize },
                    { $project: { _id: 0 } }
                ]).toArray()
            const result: PaginationSortingType<WithId<PaginationSortingType<I> & Document>> = {
                pagesCount: Math.ceil(totalCount / +pageSize),
                page: +pageNumber,
                pageSize: +pageSize,
                totalCount,
                // @ts-ignore
                items,
            };
            // @ts-ignore
            return new Promise((resolve) => resolve(result));
        },
        // @ts-ignore
        findById: (id: string) => collection<I>(collectionName).findOne({ id }, { projection: { _id: 0 } }),
        ...custom
    };
}