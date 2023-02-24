import bcrypt from 'bcrypt';
import { startApp } from "..";


let init: any = null;

export const initTestServer = async () => {
    if (init) return init;
    init = await startApp(true);
    return init;
}

export const isEmail = (email: string | undefined | null) => {
    if (typeof email !== 'string') return false;
    return !!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);
}
export const isLogin = (login: string | undefined | null) => {
    if (typeof login !== 'string') return false;
    return !!login.match(/^[a-zA-Z0-9_-]*$/g);
};

export const hashPassword = (password: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 12, (err, hash) => {
            if (err) reject(err);
            resolve(hash);
        });
    });
};

export const comparePasswords = (password: string, hash: string) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};




