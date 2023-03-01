import jwt from 'jsonwebtoken';
import { UserModel } from '../types/types';
import { settings } from '../settings';

export const jwtService = {
    createJWT(user: UserModel, expiresIn: string) {
        return jwt.sign({ userId: user.id }, settings.JWT_SECRET, { expiresIn });
    },
    getUserIdByToken(token: string) {
        try {
            return jwt.verify(token, settings.JWT_SECRET);
        } catch (e) {
            return null;
        }
    },
};
