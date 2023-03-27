import request from 'supertest';
import { initTestServer } from '../helpers/index'
import {HTTP_STATUSES, VALIDATION_ERROR_MSG, Blog, ValidationErrors, Comment} from '../types/types';
import { Express } from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { config as usersConfig } from './users.api.test';
import { config as blogsConfig } from './blogs.api.test';
import { config as postsConfig } from './posts.api.test';

export const config = {
    app: null as Express | null,
    server: null as Server<typeof IncomingMessage, typeof ServerResponse> | null,
    url: '/api/comments',
    deleteUrl: '/api/testing/all-data/',
    basicTokens: {
        correct: 'Basic YWRtaW46cXdlcnR5',
        incorrect1: 'Bearer YWRtaW46cXdlcnR5',
        incorrect2: 'Basic admin:qwerty',
        incorrect3: 'YWRtaW46cXdlcnR5',
        incorrect4: '',
    },
    blogsNames: [ 'Ivan', 'DiVan', 'JanClod Vandam', 'Test' ],
    validBody: {
        content: "contentcontentcontentcontentcontentcontentcontent"
    } as Comment,
    validBodyForUpdate: {
        content: "contentcontentcontentcontentcontentcontentcontent"
    } as Comment,
};
// @ts-ignore
const reqWithAuthHeader = (app, method: string, url: string, token: string) => request(app)[method](url).set('Authorization', token);

describe('/comments', () => {
    const {
        url, deleteUrl, basicTokens, validBody,
        validBodyForUpdate,
    } = config;
    let user = null;
    // @ts-ignore
    let blog = null;
    let post = null;
    let comment = null;
    beforeAll(async () => {
        const init = await initTestServer();
        config.app = init.app;
        config.server = init.server;
    });
    afterAll(() => config.server?.close());

    describe('DELETE ALL DATA FROM TEST TEST DB AND CHECK CLEAN RESULT', () => {
        test('should return 204', async () => {
            await request(config.app).delete(deleteUrl)
                .expect(HTTP_STATUSES.NO_CONTENT_204, {})
        });
        test('should return 200 and empty array', async () => {
            const result = await request(config.app).get(url)
                .expect(HTTP_STATUSES.OK_200)

            expect(result.body.items.length).toBe(0);
        });
    })


    describe('CREATE USER AND LOGIN USER', () => {
        test('user create', async () => {
            const response = await reqWithAuthHeader(config.app, 'post', `${usersConfig.url}`, basicTokens.correct)
                .send({
                    login: "admin12",
                    password: "12345678",
                    email: "admin@ya2.ru"
                })
                .expect(HTTP_STATUSES.CREATED_201)
            user = response.body;
            expect(response.body).toEqual({
                login: "admin12",
                email: "admin@ya2.ru",
                id: expect.any(String),
                createdAt: expect.any(String),
            });
        });
    });

    describe('CREATE BLOG', () => {
        test('blog create', async () => {
            const response = await reqWithAuthHeader(config.app, 'post', `${blogsConfig.url}`, basicTokens.correct)
                .send(blogsConfig.validBody)
                .expect(HTTP_STATUSES.CREATED_201)
            blog = response.body;
            expect(response.body).toEqual({
                ...blog,
                id: expect.any(String),
                createdAt: expect.any(String),
            });
        });
    });

    describe('CREATE POST', () => {
        test('blog create', async () => {
            const response = await reqWithAuthHeader(config.app, 'post', `${postsConfig.url}`, basicTokens.correct)
                .send({
                    ...postsConfig.validBody,
                    // @ts-ignore
                    blogId: blog.id
                })
                .expect(HTTP_STATUSES.CREATED_201)
            post = response.body;
            expect(response.body).toEqual({
                ...post,
                id: expect.any(String),
                createdAt: expect.any(String),
            });
        });
    });

    describe('TEST COMMENTS', () => {
        test('comment create', async () => {
            const response = await reqWithAuthHeader(config.app, 'post', `${postsConfig.url}`, basicTokens.correct)
                .send({
                    ...postsConfig.validBody,
                    // @ts-ignore
                    blogId: blog.id
                })
                .expect(HTTP_STATUSES.CREATED_201)
            post = response.body;
            expect(response.body).toEqual({
                ...post,
                id: expect.any(String),
                createdAt: expect.any(String),
            });
        });
    });
});