import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import blogsRoute from './routes/blogs.routes';
import postsRoute from './routes/posts.routes';
import testRoute from './routes/test.routes';
import { connectDB } from './db'


const PORT = process.env.PORT || 4082;
export const app = express();

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_AUTHORIZED_401: 401,
    NOT_FOUND_404: 404,
    SERVER_ERROR_500: 500,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Hello, world!'));
app.use('/api/posts', postsRoute);
app.use('/api/blogs', blogsRoute);
app.use('/api/testing/all-data', testRoute);


const startApp = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`http://localhost:${PORT}`))
};

startApp();