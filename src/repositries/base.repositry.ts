interface GenericRepoLayerFn<ItemType, PayloadCreate, PayloadUpdate> {
    find: () => Array<ItemType>
    findById: (id: number) => ItemType | null
    create: (payload: PayloadCreate) => ItemType
    update: (id: number, payload: PayloadUpdate) => boolean
    delete: (id: number) => boolean
    _deleteAll: () => boolean
}

interface IRow {
    id: number
    createdAt: string
}
   
export default function generateBaseRepo<I extends IRow, P, U>(items: Array<I>, custom: Object): GenericRepoLayerFn<I, P, U> {
    return {
        find: () => items,
        findById: (id: number) => items.find((i: I) => i.id === id) || null,
        create: (payload: P) => {
            const curDate = new Date();
            // @ts-ignore
            const newRow: I = { id: +curDate, createdAt: curDate.toISOString(), ...payload };
            items.push(newRow);
            return newRow;
        },
        update(id: number, payload: U) {
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
