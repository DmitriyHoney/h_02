import { hashPassword } from '../helpers';
import { usersCommandRepo, usersQueryRepo } from '../repositries/users.repositry';
import { User, VALIDATION_ERROR_MSG } from '../types/types';

export default {
    create: async (body: User) => {
        const isExistUserThisEmail = await usersQueryRepo.findUserByEmail(body.email);
        if (isExistUserThisEmail) throw new Error(VALIDATION_ERROR_MSG.USER_THIS_EMAIL_EXIST);
        
        const isExistUserThisLogin = await usersQueryRepo.findUserByLogin(body.login);
        if (isExistUserThisLogin) throw new Error(VALIDATION_ERROR_MSG.USER_THIS_LOGIN_EXIST);

        try {
            const hashedPwd = await hashPassword(body.password);
            return await usersCommandRepo.create({ ...body, password: hashedPwd });
        } catch (e) {
            throw new Error((e as Error).message);
        }
    },
    // update: async (id: string, body: User) => await usersCommandRepo.update(id, body),
    deleteOne: async (id: string) => await usersCommandRepo.delete(id),
    deleteAll: async () => await usersCommandRepo._deleteAll()
};