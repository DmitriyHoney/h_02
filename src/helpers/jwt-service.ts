import jwt from 'jsonwebtoken';
import { UserModel } from '../types/types';
import { settings } from '../settings';

export const jwtService = {
    createJWT(user: UserModel, expiresIn: string, deviceId?: string) {
        return jwt.sign({ userId: user.id, deviceId }, settings.JWT_SECRET, { expiresIn });
    },
    verifyToken(token: string) {
        try {
            return jwt.verify(token, settings.JWT_SECRET);
        } catch (e) {
            return null;
        }
    },
};
