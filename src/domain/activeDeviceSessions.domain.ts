import { deviceActiveSessionsCommandRepo } from '../repositries/activeDeviceSessions.repositry';
import { DeviceActiveSessions } from '../types/types';

export default {
    create: async (body: DeviceActiveSessions) => {
        return await deviceActiveSessionsCommandRepo.create(body);
    },
    update: async (id: string, body: DeviceActiveSessions) => await deviceActiveSessionsCommandRepo.update(id, body),
    deleteOne: async (id: string) => await deviceActiveSessionsCommandRepo.delete(id),
    deleteAll: async () => await deviceActiveSessionsCommandRepo._deleteAll(),
};