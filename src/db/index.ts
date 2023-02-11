import { MongoClient, Document, FindCursor, ObjectId } from 'mongodb';

const url = process.env.DB_URL || 'mongodb://localhost:27017';
const client = new MongoClient(url);

let dbName: string;

export const connectDB = async (isForTest: boolean = false) => {
    dbName = isForTest 
        ? process.env.DB_NAME_TEST || 'test_db'
        : process.env.DB_NAME || 'prod_db';
    try {
        await client.connect();
        console.log('Connected successfully to server')
    } catch (e) {
        console.error(e);
    }
}

export const collection = <T>(name: string) => client.db(dbName).collection<T & Document>(name)
