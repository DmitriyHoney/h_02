import { UserModel } from "./types";

declare global {
    declare namespace Express {
        export interface Request {
            context: {
                user: UserModel | null;
            }
        }
    }
}