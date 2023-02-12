import request from 'supertest';
import { HTTP_STATUSES, VALIDATION_ERROR_MSG, Post, ValidationErrors, PostModel } from '../types/types';
import { Express } from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { initTestServer } from '../helpers';
import { config as blogConfig } from './blogs.api.test';

const config = {
    app: null as Express | null,
    server: null as Server<typeof IncomingMessage, typeof ServerResponse> | null,
    url: '/api/posts',
    deleteUrl: '/api/testing/all-data/',
    basicTokens: {
        correct: 'Basic YWRtaW46cXdlcnR5',
        incorrect1: 'Bearer YWRtaW46cXdlcnR5',
        incorrect2: 'Basic admin:qwerty',
        incorrect3: 'YWRtaW46cXdlcnR5',
        incorrect4: '',
    },
    validBody: {
        blogId: '442',
        blogName: 'Bike sport',
        content: 'this is content tell us about bike and extreme sport...',
        shortDescription: 'short descr',
        title: 'Bike',
    } as Post,
    validBodyForUpdate: {
        blogId: '442',
        blogName: 'Bike sport 2',
        content: 'this is content tell us about bike and extreme sport 2...',
        shortDescription: 'short descr 2',
        title: 'Bike 2',
    } as Post,
};
// @ts-ignore
const reqWithAuthHeader = (app, method, url, token) => request(app)[method](url).set('Authorization', token);

describe('/posts', () => {
    const { 
        url, deleteUrl, basicTokens, validBody,
        validBodyForUpdate,
    } = config;
    let createdBlog: PostModel | null = null;
    beforeAll(async () => {
        const init = await initTestServer();
        config.app = init.app;
        config.server = init.server;
        await request(config.app).delete(deleteUrl)
            .expect(HTTP_STATUSES.NO_CONTENT_204, {})

        const created = await reqWithAuthHeader(config.app, 'post', blogConfig.url, basicTokens.correct)
            .send(blogConfig.validBody)
            .expect(HTTP_STATUSES.CREATED_201);

        createdBlog = created.body;
    });
    afterAll(() => config.server?.close());

    describe('INIT TEST AND CHECK CLEAN RESULT', () => {
        test('should return 200 and empty array', async () => {
            await request(config.app).get(url)
                .expect(HTTP_STATUSES.OK_200, [])
        });
    })

    describe('SET INCORRECT Basic Token [CREATE, UPDATE, DELETE]', () => {
        test('EMPTY Basic Token - shouldn`t create, update, delete', async () => {
            await request(config.app).post(url)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')
            
            await request(config.app).put(`${url}/778`)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')

            await request(config.app).delete(`${url}/778`)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')
        });
        test('INCORRECT Basic Token - shouldn`t create, update, delete', async () => {
            await reqWithAuthHeader(config.app, 'post', url, basicTokens.incorrect1)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')
            
            await reqWithAuthHeader(config.app, 'put', `${url}/778`, basicTokens.incorrect1)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')

            await reqWithAuthHeader(config.app, 'delete', `${url}/778`, basicTokens.incorrect1)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')
        });
        test('INCORRECT ENCODING Basic Token - shouldn`t create, update, delete', async () => {
            await reqWithAuthHeader(config.app, 'post', url, basicTokens.incorrect2)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')

            await reqWithAuthHeader(config.app, 'put', `${url}/778`, basicTokens.incorrect2)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')

            await reqWithAuthHeader(config.app, 'delete', `${url}/778`, basicTokens.incorrect2)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')
        });
        test('NOT word "Basic" - shouldn`t create, update, delete', async () => {
            await reqWithAuthHeader(config.app, 'post', url, basicTokens.incorrect3)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')

            await reqWithAuthHeader(config.app, 'put', `${url}/778`, basicTokens.incorrect3)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')

            await reqWithAuthHeader(config.app, 'delete', `${url}/778`, basicTokens.incorrect3)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')
        });
        test('EMPTY Token - shouldn`t create, update, delete', async () => {
            await reqWithAuthHeader(config.app, 'post', url, basicTokens.incorrect4)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')

            await reqWithAuthHeader(config.app, 'put', `${url}/778`, basicTokens.incorrect4)
                .send(validBody)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')

            await reqWithAuthHeader(config.app, 'delete', `${url}/778`, basicTokens.incorrect4)
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401, 'Not authorized')
        });
    });

    describe('SET CORRECT Basic Token TO CRUD', () => {
        let item: any;
        
        test('Basic Token - should create', async () => {
            item = await reqWithAuthHeader(config.app, 'post', url, basicTokens.correct)
                .send({
                    ...validBody,
                    blogId: String(createdBlog?.id)
                })
                .expect(HTTP_STATUSES.CREATED_201)
            
            expect(item.body).toEqual({ 
                id: expect.any(String),
                createdAt: expect.any(String),
                ...validBody,
                blogId: String(createdBlog?.id)
            });
        });
        test('Check item has been created', async () => {
            const resultAll = await request(config.app)
                .get(url)
                .expect(HTTP_STATUSES.OK_200)

            expect(resultAll.body.length).toEqual(1)
            expect(resultAll.body[0].id).toEqual(item.body.id)
        });
        test('Check updated item', async () => {
            const updtRes = await reqWithAuthHeader(config.app, 'put', `${url}/${item.body.id}`, basicTokens.correct)
                .send({
                    ...validBodyForUpdate,
                    blogId: String(createdBlog?.id)
                })
                .expect(HTTP_STATUSES.NO_CONTENT_204)

            const updatedItem = await request(config.app)
                .get(`${url}/${item.body.id}`)
                .expect(HTTP_STATUSES.OK_200)
            
            expect(updatedItem.body).toEqual({
                id: item.body.id,
                createdAt: item.body.createdAt,
                ...validBodyForUpdate,
                blogId: String(createdBlog?.id)
            });
        })
        test('Check item has been deleted', async () => {
            await reqWithAuthHeader(config.app, 'delete', `${url}/${item.body.id}`, basicTokens.correct)
                .expect(HTTP_STATUSES.NO_CONTENT_204, {})

            const result = await request(config.app)
                .get(url)
                .expect(HTTP_STATUSES.OK_200)

            expect(result.body).toEqual([])
        })
         
    });

    describe('CHECK NOT FOUND ITEM', () => {
        test('GET', async () => {
            await request(config.app).get(`${url}/778`)
                .expect(HTTP_STATUSES.NOT_FOUND_404, {})
        });
        test('UPDATE', async () => {
            await reqWithAuthHeader(config.app, 'put', `${url}/778`, basicTokens.correct)
                .send({
                    ...validBodyForUpdate,
                    blogId: String(createdBlog?.id)
                })
                .expect(HTTP_STATUSES.NOT_FOUND_404, {})
        });
        test('DELETE', async () => {
            await reqWithAuthHeader(config.app, 'delete', `${url}/778`, basicTokens.correct)
                .expect(HTTP_STATUSES.NOT_FOUND_404, {})
        });
    });

    describe('CHECK VALIDATION RULES ON POST, PUT', () => {
        test('CHECK REQUIRED FIELDS', async () => {
            const result = await reqWithAuthHeader(config.app, 'post', url, basicTokens.correct)
                .send({})
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
            expect(result.body).toEqual({
                errorsMessages: [
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'title' },
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'shortDescription' },
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'content' },
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'blogId' },
                ]
            } as ValidationErrors );
        });

        test('CHECK TYPES FIELDS', async () => {
            const result = await reqWithAuthHeader(config.app, 'post', url, basicTokens.correct)
                .send({
                    title: 12,
                    shortDescription: false,
                    content: 12,
                    blogId: false,
                    blogName: 12
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
            expect(result.body).toEqual({
                errorsMessages: [
                    { message: VALIDATION_ERROR_MSG.IS_STRING, field: 'title' },
                    { message: VALIDATION_ERROR_MSG.IS_STRING, field: 'shortDescription' },
                    { message: VALIDATION_ERROR_MSG.IS_STRING, field: 'content' },
                    { message: VALIDATION_ERROR_MSG.IS_STRING, field: 'blogId' },
                    { message: VALIDATION_ERROR_MSG.IS_STRING, field: 'blogName' },
                ]
            } as ValidationErrors );
        });

        test('CHECK EMPTY FIELDS', async () => {
            const result = await reqWithAuthHeader(config.app, 'post', url, basicTokens.correct)
                .send({
                    title: "   ",
                    shortDescription: "   ",
                    content: "   ",
                    blogId: "   ",
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
            expect(result.body).toEqual({
                errorsMessages: [
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'title' },
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'shortDescription' },
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'content' },
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'blogId' },
                ]
            } as ValidationErrors );
        });

        test('CHECK OUT OF RANGE FIELDS AND NOT BLOG THIS BLOG_ID', async () => {
            const result = await reqWithAuthHeader(config.app, 'post', url, basicTokens.correct)
                .send({
                    title: "asdqwertgdsdeerwerwerewrasdqwertgdsdeerwerwerewr",
                    shortDescription: "a",
                    content: "a",
                    blogId: "235",
                    blogName: "asd"
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
            expect(result.body).toEqual({
                errorsMessages: [
                    { message: VALIDATION_ERROR_MSG.OUT_OF_RANGE, field: 'title' },
                    { message: VALIDATION_ERROR_MSG.OUT_OF_RANGE, field: 'shortDescription' },
                    { message: VALIDATION_ERROR_MSG.OUT_OF_RANGE, field: 'content' },
                    { message: VALIDATION_ERROR_MSG.BLOG_ID_NOT_FOUND, field: 'blogId' },
                ]
            } as ValidationErrors );
        });
    });
});