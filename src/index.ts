import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookies from 'cookie-parser';
import blogsRoute from './routes/blogs.routes';
import postsRoute from './routes/posts.routes';
import usersRoute from './routes/users.routes';
import authRoute from './routes/auth.routes';
import commentsRoute from './routes/comments.routes';
import activeDeviceSissionsRoute from './routes/activeDeviceSessions.routes';
import testRoute from './routes/test.routes';
import { connectDB } from './db'
import { settings } from './settings';
const { PORT, PORT_TEST } = settings;

export const app = express();
app.use(cors());
app.use(cookies());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', true);


app.get('/', (req, res) => res.send('Hello, world!'));
app.use('/api/posts', postsRoute);
app.use('/api/blogs', blogsRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/comments', commentsRoute);
app.use('/api/security/devices', activeDeviceSissionsRoute);
app.use('/api/testing/all-data', testRoute);


export const startApp = async (isForTest: boolean = false) => {
    await connectDB(isForTest);
    const server = app.listen(isForTest ? PORT_TEST : PORT, () => console.log(`http://localhost:${isForTest ? PORT_TEST : PORT}`));
    return { app, server };
};