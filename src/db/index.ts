import { settings } from '../settings/';
import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(settings.DB_URL)
        console.log(`Connected successfully - ${settings.DB_URL}`)
    } catch (e) {
        console.error(e);
    }
}