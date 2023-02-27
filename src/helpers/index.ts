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

export const generateUUID = () => {
    let d = new Date().getTime();
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;
        if (d > 0) {
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export const comparePasswords = (password: string, hash: string) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};




