import request from 'supertest';
import {HTTP_STATUSES, VALIDATION_ERROR_MSG, Post, ValidationErrors, PostModelType, LikeStatus} from '../types/types';
import { Express } from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import {settings} from "../settings/";
import app from "../settings";
import { config as blogConfig } from './blogs.api.test';
import {connectDB} from "../db";
import {config as usersConfig} from "./users.api.test";
import {config as authConfig} from "./auth.api.test";
import {ObjectId} from "mongodb";

export const config = {
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
    let user: any, userAuthTokens: any, createdPost: any = null;
    let createdBlog: PostModelType | null = null;
    beforeAll(async () => {
        const server = app.listen(settings.PORT_TEST, async () => {
            await connectDB();
            console.log(`Example app listening on port ${settings.PORT_TEST}`);
        });
        config.app = app;
        config.server = server;
        await request(config.app).delete(deleteUrl)
            .expect(HTTP_STATUSES.NO_CONTENT_204, {})

        const created = await reqWithAuthHeader(config.app, 'post', blogConfig.url, basicTokens.correct)
            .send(blogConfig.validBody)
            .expect(HTTP_STATUSES.CREATED_201);

        createdBlog = created.body;
    });
    afterAll(() => config.server?.close());

    describe('CREATE USER AND LOGIN USER', () => {
        test('user create', async () => {
            const response = await reqWithAuthHeader(config.app, 'post', `${usersConfig.url}/`, basicTokens.correct)
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

        test('user login', async () => {
            const response = await request(config.app).post(`${authConfig.url}/login`)
                .send({
                    loginOrEmail: "admin12",
                    password: "12345678",
                })
                .expect(HTTP_STATUSES.OK_200)
            userAuthTokens = {
                accessToken: response.body.accessToken,
                // @ts-ignore
                refreshToken: response.get('Set-Cookie')[0].split("=")[1].split(';')[0]
            }

            expect(userAuthTokens).toEqual({
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            });
        });
    });

    describe('INIT TEST AND CHECK CLEAN RESULT', () => {
        test('should return 200 and empty array', async () => {
            const result = await request(config.app).get(url)
                .expect(HTTP_STATUSES.OK_200)

            expect(result.body).toEqual({
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })
            expect(result.body.items.length).toBe(0);
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
        test('Basic Token - should create', async () => {
            createdPost = await reqWithAuthHeader(config.app, 'post', url, basicTokens.correct)
                .send({
                    ...validBody,
                    // @ts-ignore
                    blogId: String(createdBlog?.id)
                })
                .expect(HTTP_STATUSES.CREATED_201)

            expect(createdPost.body).toEqual({
                id: expect.any(String),
                createdAt: expect.any(String),
                ...validBody,
                // @ts-ignore
                blogId: String(createdBlog?.id),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: LikeStatus.NONE,
                    newestLikes: []
                }
            });
        });
        test('Check createdPost has been created', async () => {
            const resultAll = await request(config.app)
                .get(url)
                .expect(HTTP_STATUSES.OK_200)

            expect(resultAll.body.items.length).toEqual(1)
            expect(resultAll.body.items[0].id).toEqual(createdPost.body.id)
        });
        test('Check updated createdPost', async () => {
            const updtRes = await reqWithAuthHeader(config.app, 'put', `${url}/${createdPost.body.id}`, basicTokens.correct)
                .send({
                    ...validBodyForUpdate,
                    // @ts-ignore
                    blogId: String(createdBlog?.id)
                })
                .expect(HTTP_STATUSES.NO_CONTENT_204)

            const updatedItem = await request(config.app)
                .get(`${url}/${createdPost.body.id}`)
                .expect(HTTP_STATUSES.OK_200)

            expect(updatedItem.body).toEqual({
                id: createdPost.body.id,
                createdAt: createdPost.body.createdAt,
                ...validBodyForUpdate,
                // @ts-ignore
                blogId: String(createdBlog?.id),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: LikeStatus.NONE,
                    newestLikes: []
                }
            });
        })
        test('Check createdPost has been deleted', async () => {
            await reqWithAuthHeader(config.app, 'delete', `${url}/${createdPost.body.id}`, basicTokens.correct)
                .expect(HTTP_STATUSES.NO_CONTENT_204, {})

            const result = await request(config.app)
                .get(url)
                .expect(HTTP_STATUSES.OK_200)

            expect(result.body.items).toEqual([])
        })

    });

    describe('CHECK NOT FOUND ITEM', () => {
        test('GET', async () => {
            await request(config.app).get(`${url}/6421d2796fac78023eabb76c/`)
                .expect(HTTP_STATUSES.NOT_FOUND_404, {})
        });
        test('UPDATE', async () => {
            await reqWithAuthHeader(config.app, 'put', `${url}/6421d2796fac78023eabb76c`, basicTokens.correct)
                .send({
                    ...validBodyForUpdate,
                    // @ts-ignore
                    blogId: String(createdBlog?.id)
                })
                .expect(HTTP_STATUSES.NOT_FOUND_404, {})
        });
        test('DELETE', async () => {
            await reqWithAuthHeader(config.app, 'delete', `${url}/6421d2796fac78023eabb76c`, basicTokens.correct)
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
    });
    
    describe('Like & dislike & cancel logic on post', () => {
        test('check unauthorized user', async () => {
            await request(config.app).put(`${config.url}/${createdPost.body.id}/like-status`)
                .send({
                    likeStatus: "qqq"
                })
                .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
        });

        test('check like post which does not exist', async () => {
            await request(config.app).put(`${config.url}/${new ObjectId()}/like-status`)
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .send({
                    likeStatus: LikeStatus.LIKE
                })
                .expect(HTTP_STATUSES.NOT_FOUND_404)
        });

        test('check like post which invalid body', async () => {
            await request(config.app).put(`${config.url}/123/like-status`)
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .send({
                    likeStatus: "qqq"
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400)
        });

        test('check like success', async () => {
            await request(config.app).put(`${config.url}/${createdPost.body.id}/like-status`)
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .send({
                    likeStatus: LikeStatus.LIKE
                })
                .expect(HTTP_STATUSES.NO_CONTENT_204)

            const result = await request(config.app).get(`${config.url}/${createdPost.body.id}`)
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .expect(HTTP_STATUSES.OK_200);

            expect(result.body).toEqual({
                id: createdPost.body.id,
                title: createdPost.body.title,

                shortDescription: createdPost.body.shortDescription, //expect.any(String),
                content: createdPost.body.content,
                // @ts-ignore
                blogId: String(createdBlog?.id),
                blogName: createdPost.body.blogName,
                createdAt: createdPost.body.createdAt,
                extendedLikesInfo: {
                    likesCount: 1,
                    dislikesCount: 0,
                    myStatus: LikeStatus.LIKE,
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: user.id,
                            login: user.login
                        }
                    ]
                }
            });
        });

        test('check dislike success', async () => {
            await request(config.app).put(`${config.url}/${createdPost.body.id}/like-status`)
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .send({
                    likeStatus: LikeStatus.DISLIKE
                })
                .expect(HTTP_STATUSES.NO_CONTENT_204)

            const result = await request(config.app).get(`${config.url}/${createdPost.body.id}`)
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .expect(HTTP_STATUSES.OK_200);

            expect(result.body).toEqual({
                id: createdPost.body.id,
                title: createdPost.body.title,

                shortDescription: createdPost.body.shortDescription, //expect.any(String),
                content: createdPost.body.content,
                // @ts-ignore
                blogId: String(createdBlog?.id),
                blogName: createdPost.body.blogName,
                createdAt: createdPost.body.createdAt,
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 1,
                    myStatus: LikeStatus.DISLIKE,
                    newestLikes: []
                }
            });
        });

        test('check cancel like & dislike success', async () => {
            await request(config.app).put(`${config.url}/${createdPost.body.id}/like-status`)
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .send({
                    likeStatus: LikeStatus.NONE
                })
                .expect(HTTP_STATUSES.NO_CONTENT_204)

            const result = await request(config.app).get(`${config.url}/${createdPost.body.id}`)
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .expect(HTTP_STATUSES.OK_200);

            expect(result.body).toEqual({
                id: createdPost.body.id,
                title: createdPost.body.title,

                shortDescription: createdPost.body.shortDescription, //expect.any(String),
                content: createdPost.body.content,
                // @ts-ignore
                blogId: String(createdBlog?.id),
                blogName: createdPost.body.blogName,
                createdAt: createdPost.body.createdAt,
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: LikeStatus.NONE,
                    newestLikes: []
                }
            });
        });
    });
});