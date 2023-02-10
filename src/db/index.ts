import { MongoClient, Document, FindCursor, ObjectId } from 'mongodb';

const url = process.env.DB_URL || 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'hw_02';

export const connectDB = async () => {
    try {
        await client.connect();
        console.log('Connected successfully to server')
    } catch (e) {
        console.error(e);
    }
    // client.close()
}


export const collection = <T>(name: string) => client.db(dbName).collection<T & Document>(name)
