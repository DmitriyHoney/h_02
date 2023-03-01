import { refreshTokensCommandRepo } from '../repositries/refresh-tokens.repositry';
import { RefreshTokens } from '../types/types';

export default {
    create: async (body: RefreshTokens) => {
        return await refreshTokensCommandRepo.create(body);
    },
    update: async (id: string, body: RefreshTokens) => await refreshTokensCommandRepo.update(id, body),
    deleteOne: async (id: string) => await refreshTokensCommandRepo.delete(id),
    deleteAll: async () => await refreshTokensCommandRepo._deleteAll(),
};