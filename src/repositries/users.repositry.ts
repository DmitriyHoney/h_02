import { CommandRepo, QueryRepo } from './base.repositry';
import { User, UserModel } from '../types/types';
import { collection } from '../db';

class UsersCommandRepo extends CommandRepo<UserModel, User> {}
export const usersCommandRepo =  new UsersCommandRepo('users');

class UsersQueryRepo extends QueryRepo<UserModel> {
    async find(
        pageSize?: string, 
        pageNumber?: string,
        sortBy?: string,
        sortDirection?: string,
        filters?: { searchLoginTerm?: string, searchEmailTerm?: string },
    ) {
        const prepareFilters: any = {};
        if (filters?.searchLoginTerm) prepareFilters.login = { $regex: filters.searchLoginTerm, $options: "i" };
        if (filters?.searchEmailTerm) prepareFilters.email = { $regex: filters.searchEmailTerm, $options: "i" };
        return await super.find(pageSize, pageNumber, sortBy, sortDirection, prepareFilters);
    }
    async findUserByEmail(email: string) {
        return await collection<UserModel>(this.collectionName).findOne({ email }, { projection: { _id: 0 } })
    }
    async findUserByLogin(login: string) {
        return await collection<UserModel>(this.collectionName).findOne({ login }, { projection: { _id: 0 } })
    }
}
export const usersQueryRepo = new UsersQueryRepo('users');