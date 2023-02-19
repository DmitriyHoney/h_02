import request from 'supertest';
import { HTTP_STATUSES, VALIDATION_ERROR_MSG, AuthBody } from '../types/types';
import { Express } from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { initTestServer } from '../helpers';

export const config = {
    app: null as Express | null,
    server: null as Server<typeof IncomingMessage, typeof ServerResponse> | null,
    url: '/api/auth',
    deleteUrl: '/api/testing/all-data/',
    basicTokens: {
        correct: 'Basic YWRtaW46cXdlcnR5',
        incorrect1: 'Bearer YWRtaW46cXdlcnR5',
        incorrect2: 'Basic admin:qwerty',
        incorrect3: 'YWRtaW46cXdlcnR5',
        incorrect4: '',
    },
    validBody: {
        loginOrEmail: '442',
        password: 'Bike sport',
    } as AuthBody,
};
// @ts-ignore
const reqWithAuthHeader = (app, method, url, token) => request(app)[method](url).set('Authorization', token);

describe('/auth', () => {
    const { url, deleteUrl, basicTokens, validBody } = config;
    let user: any = null;

    beforeAll(async () => {
        const init = await initTestServer();
        config.app = init.app;
        config.server = init.server;
        await request(config.app).delete(deleteUrl)
            .expect(HTTP_STATUSES.NO_CONTENT_204, {})

        const created = reqWithAuthHeader(config.app, 'post', 'api/users', config.basicTokens.correct)
            .send({
                login: 'testUser',
                password: '12345678',
                email: 'testuser@ya.ru'
            })
            .expect(HTTP_STATUSES.CREATED_201);

        user = created.body;
    });

    afterAll(() => config.server?.close());

    describe('CHECK INVALID BODY', () => {
        test('must returned 400 status code and password is required', async () => {
            const result = await request(config.app).post(`${url}/login`)
                .send({ loginOrEmail: 'test@mail.ru' })
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
                
                expect(result.body.errorsMessages.length).toBe(1);
                expect(result.body.errorsMessages[0]).toEqual({
                    message: VALIDATION_ERROR_MSG.REQUIRED,
                    field: 'password'
                });
        });
        test('must returned 400 status code and loginOrEmail is required', async () => {
            const result = await request(config.app).post(`${url}/login`)
                .send({ password: '12312' })
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
                
                expect(result.body.errorsMessages.length).toBe(1);
                expect(result.body.errorsMessages[0]).toEqual({
                    message: VALIDATION_ERROR_MSG.REQUIRED,
                    field: 'loginOrEmail'
                });
        });
        test('must returned 400 status code and loginOrEmail and password is required', async () => {
            const result = await request(config.app).post(`${url}/login`)
                .send({})
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
                
                expect(result.body.errorsMessages.length).toBe(2);
                expect(result.body.errorsMessages).toEqual([
                    {
                        message: VALIDATION_ERROR_MSG.REQUIRED,
                        field: 'loginOrEmail'
                    },
                    {
                        message: VALIDATION_ERROR_MSG.REQUIRED,
                        field: 'password'
                    }
                ]);
        });
        test('must returned 400 status code and loginOrEmail incorrect email', async () => {
            const result = await request(config.app).post(`${url}/login`)
                .send({ loginOrEmail: 'test@12312mail.ru', password: '12312'})
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
                
                expect(result.body.errorsMessages.length).toBe(1);
                expect(result.body.errorsMessages).toEqual([
                    {
                        message: VALIDATION_ERROR_MSG.EMAIL_OR_PASSWORD_NOT_VALID,
                        field: 'loginOrEmail'
                    },
                ]);
        });
    });

    describe('CHECK SUCCESS BODY', () => {
        test('USER EXIST AND AUTH SUCCESS must returned 201 no content', async () => {
            await request(config.app).post(`${url}/login`)
                .send({ loginOrEmail: 'testUser', password: '12345678' })
                expect(HTTP_STATUSES.NO_CONTENT_204)

            await request(config.app).post(`${url}/login`)
                .send({ loginOrEmail: 'testuser@ya.ru', password: '12345678' })
                expect(HTTP_STATUSES.NO_CONTENT_204)
        });
        test('USER NOT_EXIST AND AUTH WRONG must returned 401 no content', async () => {
            await request(config.app).post(`${url}/login`)
                .send({ loginOrEmail: 'testUser2', password: '12345678' })
                expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

            await request(config.app).post(`${url}/login`)
                .send({ loginOrEmail: 'testuser@ya.ru', password: '123456789' })
                expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
        });
    });
});