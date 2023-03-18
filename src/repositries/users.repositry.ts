import { CommandRepo, QueryRepo } from './base.repositry';
import { User, UserModelType } from '../types/types';
import { UserModel } from '../db/collections/users.collection';

class UsersCommandRepo extends CommandRepo<UserModelType, User> {}
export const usersCommandRepo =  new UsersCommandRepo(UserModel);

class UsersQueryRepo extends QueryRepo<UserModelType> {
    async find(
        pageSize?: string, 
        pageNumber?: string,
        sortBy?: string,
        sortDirection?: string,
        filters?: { searchLoginTerm?: string, searchEmailTerm?: string },
    ) {
        const prepareFilters: any = {};
        if (filters?.searchLoginTerm) {
            if (!prepareFilters.$or) prepareFilters.$or = [];
            prepareFilters.$or.push({ login: { $regex: filters.searchLoginTerm, $options: "i" } })
        };
        if (filters?.searchEmailTerm) {
            if (!prepareFilters.$or) prepareFilters.$or = [];
            prepareFilters.$or.push({ email: { $regex: filters.searchEmailTerm, $options: "i" } });
        }
        return await super.find(pageSize, pageNumber, sortBy, sortDirection, prepareFilters, { confirmedInfo: 0 });
    }
    async findUserByEmail(email: string) {
        return await UserModel.findOne({ email }, { projection: { _id: 0 } })
    }
    async findUserByLogin(login: string) {
        return await UserModel.findOne({ login }, { projection: { _id: 0 } })
    }
    async findNoActUserByConfirmedCode(code: string) {
        return await UserModel.findOne({ 'confirmedInfo.code': code, 'confirmedInfo.isConfirmedEmail': false }, { projection: { _id: 0 } })
    }
    async findById(id: string) {
        return await UserModel.findById(id, { confirmedInfo: 0 });
    }
}

export const userMappersQuery = {
    authMe(user: UserModelType & { id: number | string }) {
        return {
            email: user.email,
            login: user.login,
            userId: user.id,
        }
    }
}

export const usersQueryRepo = new UsersQueryRepo(UserModel);
