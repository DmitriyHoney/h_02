import { settings } from '../settings/';
import mongoose from 'mongoose';

export const connectDB = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(settings.DB_URL);
            console.log(`Connected successfully - ${settings.DB_URL}`)
            resolve(true);
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });

}