import { settings } from '../settings';
import mongoose from 'mongoose';

let dbName: string;

export const connectDB = async (isForTest: boolean = false) => {
    dbName = isForTest ? settings.DB_NAME_TEST : settings.DB_NAME;
    console.log(`${settings.DB_URL}/${dbName}`);
    try {
        await mongoose.connect(`${settings.DB_URL}/${dbName}`);
        console.log(`Connected successfully - (DATA BASE NAME: ${dbName})`)
    } catch (e) {
        console.error(e);
    }
}