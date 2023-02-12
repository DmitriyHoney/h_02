import { Document, WithId, InsertOneResult } from 'mongodb';
import { collection } from '../db'
interface GenericRepoLayerFn<ItemType, Payload> {
    find: () => Promise<WithId<ItemType & Document>[]>
    findById: (id: string) => Promise<WithId<ItemType & Document> | null>
    create: (payload: Payload) => Promise<Payload>
    update: (id: string, payload: Payload) => Promise<boolean>
    delete: (id: string) => Promise<boolean>
    _deleteAll: () => Promise<boolean>
}


export default function generateBaseRepo<I, P, C>(collectionName: string, custom: C): GenericRepoLayerFn<I, P> & C {
    return {
        // @ts-ignore
        find: () => collection<I>(collectionName).find({}, { projection: { _id: 0 } }).toArray(),
        // @ts-ignore
        findById: (id: string) => collection<I>(collectionName).findOne({ id }, { projection: { _id: 0 } }),
        
        create: async (payload: P) => {
            const curDate = new Date();
            // @ts-ignore
            await collection<I>(collectionName).insertOne({ 
                id: String(curDate.getTime()),
                createdAt: curDate.toISOString(),
                ...payload 
            });
            return {
                id: String(curDate.getTime()),
                createdAt: curDate.toISOString(),
                ...payload
            };
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