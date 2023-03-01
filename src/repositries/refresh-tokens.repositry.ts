import { CommandRepo, QueryRepo } from './base.repositry';
import { RefreshTokensModel, RefreshTokens } from '../types/types';
import { collection } from '../db';

class RefreshTokensCommandRepo extends CommandRepo<RefreshTokensModel, RefreshTokens> {}
export const refreshTokensCommandRepo = new RefreshTokensCommandRepo('refresh_tokens');


class RefreshTokensQueryRepo extends QueryRepo<RefreshTokensModel> {
    async findByToken(token: string) {
        return await collection<RefreshTokensModel>(this.collectionName).findOne({ token }, { projection: { _id: 0 } })
    }
}
export const refreshTokensQueryRepo = new RefreshTokensQueryRepo('refresh_tokens');