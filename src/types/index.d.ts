import { UserModelType } from "./types";

declare global {
    declare namespace Express {
        export interface Request {
            context: {
                user: UserModelType | null,
                verifiedToken: { 
                    userId: string | number, 
                    deviceId: string | number 
                } | null | undefined, 
                userIP: string | undefined,
            }
        }
    }
}