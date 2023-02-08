import { BaseDbEntity } from '../types/types';

interface GenericRepoLayerFn<ItemType, Payload> {
    find: () => Array<ItemType>
    findById: (id: string) => ItemType | null
    create: (payload: Payload) => ItemType
    update: (id: string, payload: Payload) => boolean
    delete: (id: string) => boolean
    _deleteAll: () => boolean
}

   
export default function generateBaseRepo<I extends BaseDbEntity, P, C>(items: Array<I>, custom: C): GenericRepoLayerFn<I, P> & C {
    return {
        find: () => items,
        findById: (id: string) => items.find((i: I) => i.id === id) || null,
        create: (payload: P) => {
            const curDate = new Date();
            // @ts-ignore
            const newRow: I = { id: String(curDate.getTime()), ...payload };
            items.push(newRow);
            return newRow;
        },
        update(id: string, payload: P) {
            let row = this.findById(id);
            if (!row) return false;
            // @ts-ignore
            row = { ... payload };
            return true;
        },
        delete(id: string) {
            const isExistIdx = items.findIndex((i: I) => i.id === id);
            if (isExistIdx < 0) return false;
            items.splice(isExistIdx, 1);
            return true;
        },
       _deleteAll() {
            items = [];
            return true;
       },
       ...custom
    };
}
