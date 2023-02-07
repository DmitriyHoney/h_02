import express from 'express';
import bodyParser from 'body-parser';
import productsRoute from './routes/blogs.routes';
import postsRoute from './routes/posts.routes';
import testRoute from './routes/test.routes';

const PORT = 4080;
export const app = express();

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404,
    SERVER_ERROR_500: 500,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Hello, world!'));
app.use('/ht_02/api/posts', postsRoute);
app.use('/ht_02/api/blogs', productsRoute);
app.use('/ht_02/api/testing/all-data', testRoute);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))