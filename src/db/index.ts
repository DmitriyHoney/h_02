import { Document } from 'mongodb';
import { settings } from '../settings';
import mongoose from 'mongoose';

let dbName: string;

export const connectDB = async (isForTest: boolean = false) => {
    dbName = isForTest ? settings.DB_NAME_TEST : settings.DB_NAME;
    try {
        await mongoose.connect(settings.DB_URL);
        console.log(`Connected successfully - (DATA BASE NAME: ${dbName})`)
    } catch (e) {
        console.error(e);
    }
}