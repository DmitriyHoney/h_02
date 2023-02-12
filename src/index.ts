import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import blogsRoute from './routes/blogs.routes';
import postsRoute from './routes/posts.routes';
import testRoute from './routes/test.routes';
import { connectDB } from './db'


const PORT = process.env.PORT || 3000;
const PORT_TEST = process.env.PORT_TEST || 3001;
export const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Hello, world!'));
app.use('/api/posts', postsRoute);
app.use('/api/blogs', blogsRoute);
app.use('/api/testing/all-data', testRoute);


export const startApp = async (isForTest: boolean = false) => {
    await connectDB(isForTest);
    const server = app.listen(isForTest ? PORT_TEST : PORT, () => console.log(`http://localhost:${isForTest ? PORT_TEST : PORT}`));
    return { app, server };
};