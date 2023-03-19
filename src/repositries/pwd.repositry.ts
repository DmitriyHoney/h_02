import { CommandRepo, QueryRepo } from './base.repositry';
import { PwdModelType, Pwd } from '../types/types';
import { RecreatePwdModel } from '../db/collections/recreatepwd.collection';


class PwdCommandRepo extends CommandRepo<PwdModelType, Pwd> {}
// @ts-ignore
export const pwdCommandRepo = new PwdCommandRepo(RecreatePwdModel);


class PwdQueryRepo extends QueryRepo<PwdModelType> {
    async findByCode(code: string) {
        return await this.collection.findOne({ code, isActive: true });
    }
}
// @ts-ignore
export const pwdQueryRepo = new PwdQueryRepo(RecreatePwdModel);