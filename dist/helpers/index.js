"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = exports.generateUUID = exports.getUserIp = exports.generateExpiredDate = exports.isUrl = exports.hashPassword = exports.isLogin = exports.isEmail = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const isEmail = (email) => {
    if (typeof email !== 'string')
        return false;
    return !!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);
};
exports.isEmail = isEmail;
const isLogin = (login) => {
    if (typeof login !== 'string')
        return false;
    return !!login.match(/^[a-zA-Z0-9_-]*$/g);
};
exports.isLogin = isLogin;
const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt_1.default.hash(password, 12, (err, hash) => {
            if (err)
                reject(err);
            resolve(hash);
        });
    });
};
exports.hashPassword = hashPassword;
const isUrl = (v) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(v);
};
exports.isUrl = isUrl;
const generateExpiredDate = (obj) => {
    const expiredDate = new Date();
    expiredDate.setHours(expiredDate.getHours() + obj.hours);
    expiredDate.setMinutes(expiredDate.getMinutes() + obj.min);
    expiredDate.setSeconds(expiredDate.getSeconds() + obj.sec);
    return expiredDate;
};
exports.generateExpiredDate = generateExpiredDate;
const getUserIp = (req) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!ip)
        return false;
    return Array.isArray(ip) ? ip[0] : ip;
};
exports.getUserIp = getUserIp;
const generateUUID = () => {
    let d = new Date().getTime();
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        }
        else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};
exports.generateUUID = generateUUID;
const comparePasswords = (password, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt_1.default.compare(password, hash, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });
};
exports.comparePasswords = comparePasswords;
