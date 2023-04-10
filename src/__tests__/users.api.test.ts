import request from 'supertest';
import { HTTP_STATUSES, VALIDATION_ERROR_MSG, User } from '../types/types';
import { Express } from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import {settings} from "../settings/";
import app from "../settings";
import {connectDB} from "../db";

export const config = {
    app: null as Express | null,
    server: null as Server<typeof IncomingMessage, typeof ServerResponse> | null,
    url: '/api/users',
    deleteUrl: '/api/testing/all-data/',
    basicTokens: {
        correct: 'Basic YWRtaW46cXdlcnR5',
        incorrect1: 'Bearer YWRtaW46cXdlcnR5',
        incorrect2: 'Basic admin:qwerty',
        incorrect3: 'YWRtaW46cXdlcnR5',
        incorrect4: '',
    },
    validBody: {
        email: 'test@ya.ru',
        login: 'testlogin',
        password: '12345678'
    } as User,
};
// @ts-ignore
const reqWithAuthHeader = (app, method, url, token) => request(app)[method](url).set('Authorization', token);

describe('/auth', () => {
    const { url, deleteUrl, basicTokens, validBody } = config;
    let user: any = null;

    beforeAll(async () => {
        const server = app.listen(settings.PORT_TEST, async () => {
            await connectDB();
            console.log(`Example app listening on port ${settings.PORT_TEST}`);
        });
        config.app = app;
        config.server = server;
        await request(config.app).delete(deleteUrl)
            .expect(HTTP_STATUSES.NO_CONTENT_204, {})
    });

    afterAll(() => config.server?.close());

    describe('CHECK CREATE USER', () => {
        test('must returned 200 status code', async () => {
            const created = await reqWithAuthHeader(config.app, 'post', config.url, config.basicTokens.correct)
                .send(validBody)
                .expect(HTTP_STATUSES.CREATED_201);
            
            user = created.body;
            expect(user).toEqual({
                id: expect.any(String),
                createdAt: expect.any(String),
                login: validBody.login,
                email: validBody.email
            })
        });
        test('must returned 400 badRequest and error messages', async () => {
            const created = await reqWithAuthHeader(config.app, 'post', config.url, config.basicTokens.correct)
                .send({
                    password: '12345678',
                    email: 'testuser@ya.ru'
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400);
        
            expect(created.body).toEqual({
                errorsMessages: [
                    {
                        message: VALIDATION_ERROR_MSG.REQUIRED,
                        field: 'login'
                    }
                ]
            })
        });
    });

    describe('CHECK Unauthorized', () => {
        test('must returned 401 status code', async () => {
            await request(config.app)
                .post(config.url)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
        });
        test('must returned 401 status code', async () => {
            await request(config.app)
                .get(config.url)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
        });
        test('must returned 401 status code', async () => {
            await request(config.app)
                .delete(`${config.url}/42`)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
        });
    });

    describe('CHECK CANNOT CREATE USER THIS EMAIL OR LOGIN', () => {
        test('must returned 400 status code email exist', async () => {
            const created = await reqWithAuthHeader(config.app, 'post', config.url, config.basicTokens.correct)
                .send({
                    ...validBody,
                    login: 'aaaaaa'
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400);
            
            expect(created.body).toEqual({
                errorsMessages: [
                    {
                        message: VALIDATION_ERROR_MSG.USER_THIS_EMAIL_EXIST,
                        field: 'email'
                    }
                ]
            })
        });
        test('must returned 400 status code login exist', async () => {
            const created = await reqWithAuthHeader(config.app, 'post', config.url, config.basicTokens.correct)
                .send({
                    ...validBody,
                    email: 'testuser22@ya.ru'
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400);
            
            expect(created.body).toEqual({
                errorsMessages: [
                    {
                        message: VALIDATION_ERROR_MSG.USER_THIS_LOGIN_EXIST,
                        field: 'login'
                    }
                ]
            })
        });
    });
});