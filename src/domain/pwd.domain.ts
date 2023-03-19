import { pwdCommandRepo } from '../repositries/pwd.repositry';
import { Pwd } from '../types/types';

export default {
    create: async (body: Pwd) => {
        return await pwdCommandRepo.create(body);
    },
    update: async (id: string, body: Pwd) => await pwdCommandRepo.update(id, body),
    deleteOne: async (id: string) => await pwdCommandRepo.delete(id),
    deleteAll: async () => await pwdCommandRepo._deleteAll(),
    isCodeConfirmationValid: (date: string) => {
        const expiredDate = new Date(date);
        const curDate = new Date();
        const isDateNotExpired = curDate <= expiredDate;
        return isDateNotExpired;
    }
};