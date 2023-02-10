import { Document, WithId, InsertOneResult } from 'mongodb';
import { collection } from '../db'
interface GenericRepoLayerFn<ItemType, Payload> {
    find: () => Promise<WithId<ItemType & Document>[]>
    findById: (id: number) => Promise<WithId<ItemType & Document> | null>
    create: (payload: Payload) => Promise<Payload>
    update: (id: number, payload: Payload) => Promise<boolean>
    delete: (id: number) => Promise<boolean>
    _deleteAll: () => Promise<boolean>
}


export default function generateBaseRepo<I, P, C>(collectionName: string, custom: C): GenericRepoLayerFn<I, P> & C {
    return {
        find: () => collection<I>(collectionName).find().toArray(),
        // @ts-ignore
        findById: (id: number) => collection<I>(collectionName).findOne({ id }),
        
        create: async (payload: P) => {
            // @ts-ignore
            const res = await collection<I>(collectionName).insertOne({
                id: new Date().getTime(),
                payload
            });
            return payload;
        },
        update: async (id: number, payload: P) => {
            // @ts-ignore
            const result = await collection<I>(collectionName).updateOne({ id }, payload);
            return result.matchedCount === 1
        },
        delete: async (id: number) => {
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