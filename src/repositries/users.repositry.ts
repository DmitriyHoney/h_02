import { CommandRepo, QueryRepo } from './base.repositry';
import { User, UserModelType } from '../types/types';
import { UserModel } from '../db/collections/users.collection';
import { ObjectId } from 'mongoose';
import {inject, injectable, named} from "inversify";

@injectable()
export class UsersCommandRepo extends CommandRepo<UserModelType, User> {
    public constructor(@inject(UserModel) @named("master2") collection: any) { // length = 0
        super(collection);
    }
}
// @ts-ignore
export const usersCommandRepo =  new UsersCommandRepo(UserModel);

const baseUserExludeFields = {
    confirmedInfo: 0,
    password: 0,
    updatedAt: 0,
};

@injectable()
export class UsersQueryRepo extends QueryRepo<UserModelType> {
    public constructor(
        @inject(UserModel) @named("master") collection: any
    ) { // length = 0
        super(collection);
    }
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
        }
        if (filters?.searchEmailTerm) {
            if (!prepareFilters.$or) prepareFilters.$or = [];
            prepareFilters.$or.push({ email: { $regex: filters.searchEmailTerm, $options: "i" } });
        }
        return await super.find(pageSize, pageNumber, sortBy, sortDirection, prepareFilters, baseUserExludeFields);
    }
    async findUserByEmail(email: string) {
        return await this.collection.findOne({ email }, { projection: baseUserExludeFields })
    }
    async findUserByLogin(login: string) {
        return await this.collection.findOne({ login }, { projection: baseUserExludeFields })
    }
    async findNoActUserByConfirmedCode(code: string) {
        return await this.collection.findOne({ 'confirmedInfo.code': code, 'confirmedInfo.isConfirmedEmail': false }, { projection: baseUserExludeFields })
    }
    async findById(id: ObjectId) {
        return await super.findById(id, baseUserExludeFields);
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
// @ts-ignore
export const usersQueryRepo = new UsersQueryRepo(UserModel);
