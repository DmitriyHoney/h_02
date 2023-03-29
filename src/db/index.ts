import { settings } from '../settings';
import mongoose from 'mongoose';

let dbName: string;

export const connectDB = async (isForTest: boolean = false) => {
    dbName = isForTest ? settings.DB_NAME_TEST : settings.DB_NAME;
    try {
        const urldb = settings.DB_URL.indexOf('localhost') >= 0 ? `${settings.DB_URL}/${dbName}` : `${settings.DB_URL}`;
        await mongoose.connect(urldb)
        console.log(`Connected successfully - ${urldb}`)
    } catch (e) {
        console.error(e);
    }
}