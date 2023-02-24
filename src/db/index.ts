import { MongoClient, Document } from 'mongodb';
import { settings } from '../settings';

const url = settings.DB_URL;
const client = new MongoClient(url);

let dbName: string;

export const connectDB = async (isForTest: boolean = false) => {
    dbName = isForTest ? settings.DB_NAME_TEST : settings.DB_NAME;
    try {
        await client.connect();
        console.log(`Connected successfully - (DATA BASE NAME: ${dbName})`)
    } catch (e) {
        console.error(e);
    }
}

export const collection = <T>(name: string) => client.db(dbName).collection<T & Document>(name)
