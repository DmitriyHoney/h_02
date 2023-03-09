import { CommandRepo, QueryRepo } from './base.repositry';
import { DeviceActiveSessionsModel, DeviceActiveSessions } from '../types/types';
import { collection } from '../db';

class DeviceActiveSessionsCommandRepo extends CommandRepo<DeviceActiveSessionsModel, DeviceActiveSessions> {
    async deleteAllByUserId(userId: string) {
        const result = await collection<DeviceActiveSessionsModel>(this.collectionName).deleteMany({ _userId: userId });
        return result.deletedCount > 0;
    }
}
export const deviceActiveSessionsCommandRepo = new DeviceActiveSessionsCommandRepo('active_device_sessions');


class DeviceActiveSessionsQueryRepo extends QueryRepo<DeviceActiveSessionsModel> {
    async findByIpAndDeviceId(ip: string, deviceId: string) {
        return await collection<DeviceActiveSessionsModel>(this.collectionName).findOne({ ip, deviceId }, { projection: { _id: 0 } })
    }
    async findByDeviceId(deviceId: string) {
        return await collection<DeviceActiveSessionsModel>(this.collectionName).findOne({ deviceId }, { projection: { _id: 0 } })
    }
    async findAllByCurrentUser(userId: string | number) {
        return await super.findAll({ _userId: userId }, { _expirationDate: 0, _userId: 0 });
    }
}
export const deviceActiveSessionsQueryRepo = new DeviceActiveSessionsQueryRepo('active_device_sessions');