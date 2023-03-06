import { UserModel } from "./types";

declare global {
    declare namespace Express {
        export interface Request {
            context: {
                user: UserModel | null,
                verifiedToken: { 
                    userId: string | number, 
                    deviceId: string | number 
                } | null | undefined, 
                userIP: string | undefined,
            }
        }
    }
}