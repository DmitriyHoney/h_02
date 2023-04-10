import { UsersCommandRepo, UsersQueryRepo } from '../repositries/users.repositry'; //usersQueryRepo, usersCommandRepo
import { User, VALIDATION_ERROR_MSG } from '../types/types';
import {inject, injectable} from "inversify";

@injectable()
export class UserDomain {
    constructor(
        @inject(UsersQueryRepo) public usersQueryRepo: UsersQueryRepo,
        @inject(UsersCommandRepo) public usersCommandRepo: UsersCommandRepo,
    ) {}
    async create(body: User) {
        const isExistUserThisEmail = await this.usersQueryRepo.findUserByEmail(body.email);
        if (isExistUserThisEmail) throw new Error(VALIDATION_ERROR_MSG.USER_THIS_EMAIL_EXIST);
        
        const isExistUserThisLogin = await this.usersQueryRepo.findUserByLogin(body.login);
        if (isExistUserThisLogin) throw new Error(VALIDATION_ERROR_MSG.USER_THIS_LOGIN_EXIST);
        try {
            return await this.usersCommandRepo.create(body);
        } catch (e) {
            throw new Error((e as Error).message);
        }
    }
    async update(id: string, body: User) {
        return await this.usersCommandRepo.update(id, body);
    }
    async deleteOne(id: string) {
        return await this.usersCommandRepo.delete(id);
    }
    async deleteAll() {
        return await this.usersCommandRepo._deleteAll();
    }
}