import { CommandRepo, QueryRepo } from './base.repositry';
import { DeviceActiveSessionsModel, DeviceActiveSessions } from '../types/types';
import { collection } from '../db';

class DeviceActiveSessionsCommandRepo extends CommandRepo<DeviceActiveSessionsModel, DeviceActiveSessions> {}
export const deviceActiveSessionsCommandRepo = new DeviceActiveSessionsCommandRepo('active_device_sessions');


class DeviceActiveSessionsQueryRepo extends QueryRepo<DeviceActiveSessionsModel> {
    async findByIpAndDeviceId(ip: string, deviceId: string) {
        return await collection<DeviceActiveSessionsModel>(this.collectionName).findOne({ ip, deviceId }, { projection: { _id: 0 } })
    }
    async findAllByCurrentUser(
        userId: string | number,

        pageSize?: string, 
        pageNumber?: string,
        sortBy?: string,
        sortDirection?: string,
    ) {
        return await super.find(
            pageSize, 
            pageNumber, 
            sortBy, 
            sortDirection, 
            { _userId: userId }, 
            { _expirationDate: 0, _userId: 0 }
        );
    }
}
export const deviceActiveSessionsQueryRepo = new DeviceActiveSessionsQueryRepo('active_device_sessions');