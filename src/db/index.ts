import { settings } from '../settings';
import mongoose from 'mongoose';

let dbName: string;

export const connectDB = async (isForTest: boolean = false) => {
    dbName = isForTest ? settings.DB_NAME_TEST : settings.DB_NAME;
    try {
        settings.DB_URL.indexOf('localhost') >= 0
            ? await mongoose.connect(`${settings.DB_URL}/${dbName}`)
            : await mongoose.connect(`${settings.DB_URL}`)
        console.log(`Connected successfully - ${settings.DB_URL}/${dbName}`)
    } catch (e) {
        console.error(e);
    }
}