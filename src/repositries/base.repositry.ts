import { BaseDbEntity } from '../types/types';

interface GenericRepoLayerFn<ItemType, Payload> {
    find: () => Array<ItemType>
    findById: (id: number) => ItemType | null
    create: (payload: Payload) => ItemType
    update: (id: number, payload: Payload) => boolean
    delete: (id: number) => boolean
    _deleteAll: () => boolean
}

   
export default function generateBaseRepo<I extends BaseDbEntity, P>(items: Array<I>, custom: Object = {}): GenericRepoLayerFn<I, P> {
    return {
        find: () => items,
        findById: (id: number) => items.find((i: I) => i.id === id) || null,
        create: (payload: P) => {
            const curDate = new Date();
            // @ts-ignore
            const newRow: I = { id: +curDate, ...payload };
            items.push(newRow);
            return newRow;
        },
        update(id: number, payload: P) {
            let row = this.findById(id);
            if (!row) return false;
            // @ts-ignore
            row = { ... payload };
            return true;
        },
        delete(id: number) {
            const isExist = items.findIndex((i: I) => i.id === id);
            if (!isExist) return false;
            items = items.filter((i: I) => i.id === id);
            return true;
        },
       _deleteAll() {
            items = [];
            return true;
       },
       ...custom
    };
}
