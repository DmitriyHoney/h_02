import { CommandRepo, QueryRepo } from './base.repositry';
import { DeviceActiveSessionsModelType, DeviceActiveSessions } from '../types/types';
import { SessionModel } from '../db/collections/sessions.collection';

class DeviceActiveSessionsCommandRepo extends CommandRepo<DeviceActiveSessionsModelType, DeviceActiveSessions> {
    async deleteAllByUserId(userId: string, excludeItemId: string) {
        const result = await SessionModel.deleteMany({ _userId: userId, id: { $ne: excludeItemId } });
        return result.deletedCount > 0;
    }
}
// @ts-ignore
export const deviceActiveSessionsCommandRepo = new DeviceActiveSessionsCommandRepo(SessionModel);


class DeviceActiveSessionsQueryRepo extends QueryRepo<DeviceActiveSessionsModelType> {
    async findByIpAndDeviceId(ip: string, deviceId: string) {
        return await SessionModel.findOne({ ip, deviceId }, { projection: { _id: 0 } })
    }
    async findByDeviceId(deviceId: string) {
        return await SessionModel.findOne({ deviceId }, { projection: { _id: 0 } })
    }
    async findAllByCurrentUser(userId: string | number) {
        return await super.findAll({ _userId: userId }, { _expirationDate: 0, _userId: 0, id: 0, createdAt: 0 });
    }
}
// @ts-ignore
export const deviceActiveSessionsQueryRepo = new DeviceActiveSessionsQueryRepo(SessionModel);