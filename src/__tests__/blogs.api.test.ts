import request from 'supertest';
import { initTestServer } from '../helpers/index'
import { HTTP_STATUSES, VALIDATION_ERROR_MSG, Blog, ValidationErrors } from '../types/types';
import { Express } from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';

export const config = {
    app: null as Express | null,
    server: null as Server<typeof IncomingMessage, typeof ServerResponse> | null,
    url: '/api/blogs',
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
        name: 'Post 1',
        description: 'Description post 1',
        websiteUrl: 'https://ya.ru',
        isMembership: false,
    } as Blog,
    validBodyForUpdate: {
        name: 'Post 2',
        description: 'Description post 2',
        websiteUrl: 'https://mail.ru',
        isMembership: false,
    } as Blog,
};
// @ts-ignore
const reqWithAuthHeader = (app, method: string, url: string, token: string) => request(app)[method](url).set('Authorization', token);

describe('/blogs', () => {
    const { 
        url, deleteUrl, basicTokens, validBody,
        validBodyForUpdate,
    } = config;
    beforeAll(async () => {
        const init = await initTestServer();
        config.app = init.app;
        config.server = init.server;

        await request(config.app).delete(deleteUrl)
            .expect(HTTP_STATUSES.NO_CONTENT_204, {})
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
                .send(validBody)
                .expect(HTTP_STATUSES.CREATED_201)
            
            expect(item.body).toEqual({ 
                id: expect.any(String),
                createdAt: expect.any(String),
                ...validBody 
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
            await reqWithAuthHeader(config.app, 'put', `${url}/${item.body.id}`, basicTokens.correct)
                .send(validBodyForUpdate)
                .expect(HTTP_STATUSES.NO_CONTENT_204)

            const updatedItem = await request(config.app)
                .get(`${url}/${item.body.id}`)
                .expect(HTTP_STATUSES.OK_200)
            
            expect(updatedItem.body).toEqual({
                id: item.body.id,
                createdAt: item.body.createdAt,
                ...validBodyForUpdate
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
                .send(validBodyForUpdate)
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
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'name' },
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'description' },
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'websiteUrl' },
                ]
            } as ValidationErrors );
        });

        test('CHECK TYPES FIELDS', async () => {
            const result = await reqWithAuthHeader(config.app, 'post', url, basicTokens.correct)
                .send({
                    name: 12,
                    description: false,
                    websiteUrl: { a: 1 }
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
            expect(result.body).toEqual({
                errorsMessages: [
                    { message: VALIDATION_ERROR_MSG.IS_STRING, field: 'name' },
                    { message: VALIDATION_ERROR_MSG.IS_STRING, field: 'description' },
                    { message: VALIDATION_ERROR_MSG.IS_URL, field: 'websiteUrl' },
                ]
            } as ValidationErrors );
        });

        test('CHECK EMPTY FIELDS', async () => {
            const result = await reqWithAuthHeader(config.app, 'post', url, basicTokens.correct)
                .send({
                    name: "    ",
                    description: "   ",
                    websiteUrl: "    "
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
            expect(result.body).toEqual({
                errorsMessages: [
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'name' },
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'description' },
                    { message: VALIDATION_ERROR_MSG.REQUIRED, field: 'websiteUrl' },
                ]
            } as ValidationErrors );
        });

        test('CHECK OUT OF RANGE FIELDS', async () => {
            const result = await reqWithAuthHeader(config.app, 'post', url, basicTokens.correct)
                .send({
                    name: "A",
                    description: "B",
                    websiteUrl: "https://ya.ru"
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
            expect(result.body).toEqual({
                errorsMessages: [
                    { message: VALIDATION_ERROR_MSG.OUT_OF_RANGE, field: 'name' },
                    { message: VALIDATION_ERROR_MSG.OUT_OF_RANGE, field: 'description' },
                ]
            } as ValidationErrors );
        });
    });

    describe('CHECK QUERY PARAMS SEARCH', () => {
        test('create test blogs', async () => {
            const createPromises: Array<Promise<any>> = [];
            config.blogsNames.forEach((blogName) => {
                const promise = reqWithAuthHeader(config.app, 'post', url, basicTokens.correct)
                    .send({ ...validBody, name: blogName })
                createPromises.push(promise);
            });
            await Promise.all(createPromises);
        });

        test('check queryParam searchNameTerm (not item this name)', async () => {
            await request(config.app).get(`${url}?searchNameTerm=qwertyuiop`)
                .expect(HTTP_STATUSES.OK_200, [])
        });

        test('check queryParam searchNameTerm (exist 3 item this name)', async () => {
            const result = await request(config.app).get(`${url}?searchNameTerm=va`)
                .expect(HTTP_STATUSES.OK_200);

            expect(result.body.length).toEqual(3);
        });
    });
});