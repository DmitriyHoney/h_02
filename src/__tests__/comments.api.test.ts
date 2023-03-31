import request from 'supertest';
import {HTTP_STATUSES, VALIDATION_ERROR_MSG, Blog, ValidationErrors, Comment, LikeStatus} from '../types/types';
import { Express } from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { config as usersConfig } from './users.api.test';
import { config as blogsConfig } from './blogs.api.test';
import { config as postsConfig } from './posts.api.test';
import { config as authConfig } from './auth.api.test';
import {settings} from "../settings/";
import app from "../settings";
import {connectDB} from "../db";

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
    // @ts-ignore
    let user, userAuthTokens, blog, post, comment = null;
    beforeAll(async () => {
        const server = app.listen(settings.PORT_TEST, async () => {
            await connectDB();
            console.log(`Example app listening on port ${settings.PORT_TEST}`);
        });
        config.app = app;
        config.server = server;
    });
    afterAll(() => config.server?.close());

    describe('DELETE ALL DATA FROM TEST TEST DB AND CHECK CLEAN RESULT', () => {
        test('should return 204', async () => {
            await request(config.app).delete(deleteUrl)
                .expect(HTTP_STATUSES.NO_CONTENT_204, {})
        });
    })


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
        test('post create', async () => {
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

    describe('TEST COMMENT LOGIC', () => {
        test('create comment', async () => {
            // @ts-ignore
            const response = await request(config.app).post(`${postsConfig.url}/${post.id}/comments`)
                // @ts-ignore
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .send(config.validBody)
                .expect(HTTP_STATUSES.CREATED_201)

            comment = response.body;
            expect(response.body).toEqual({
                id: expect.any(String),
                content: comment.content,
                commentatorInfo: {
                    // @ts-ignore
                    userId: user.id,
                    // @ts-ignore
                    userLogin: user.login
                },
                createdAt: expect.any(String),
                likesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: "None"
                }
            });
        });
        test('like comment', async () => {
            await request(config.app)
                // @ts-ignore
                .put(`${config.url}/${comment.id}/like-status`)
                // @ts-ignore
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                // @ts-ignore
                .set('Cookie', [`refreshToken=${userAuthTokens.refreshToken}`])
                // @ts-ignore
                .send({
                    likeStatus: LikeStatus.LIKE,
                })
                .expect(HTTP_STATUSES.NO_CONTENT_204);
        });
        test('check like comment', async () => {
            // config.app.request.cookies.refreshToken = userAuthTokens.refreshToken
            const postComments = await request(config.app)
                // @ts-ignore
                .get(`${postsConfig.url}/${post.id}/comments`)
                // @ts-ignore
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .expect(HTTP_STATUSES.OK_200)
            //
            expect(postComments.body.items.length).toBe(1);
            //
            comment = postComments.body.items[0];
            expect(comment).toEqual({
                id: expect.any(String),
                content: comment.content,
                commentatorInfo: {
                    // @ts-ignore
                    userId: user.id,
                    // @ts-ignore
                    userLogin: user.login
                },
                createdAt: expect.any(String),
                likesInfo: {
                    likesCount: 1,
                    dislikesCount: 0,
                    myStatus: LikeStatus.LIKE
                }
            });
        });


        test('dislike comment', async () => {
            await request(config.app)
                // @ts-ignore
                .put(`${config.url}/${comment.id}/like-status`)
                // @ts-ignore
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                // @ts-ignore
                .send({
                    likeStatus: LikeStatus.DISLIKE,
                })
                .expect(HTTP_STATUSES.NO_CONTENT_204);
        });
        test('check dislike comment', async () => {
            // config.app.request.cookies.refreshToken = userAuthTokens.refreshToken
            const postComments = await request(config.app)
                // @ts-ignore
                .get(`${postsConfig.url}/${post.id}/comments`)
                // @ts-ignore
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .expect(HTTP_STATUSES.OK_200)
            //
            expect(postComments.body.items.length).toBe(1);
            //
            comment = postComments.body.items[0];
            expect(comment).toEqual({
                id: expect.any(String),
                content: comment.content,
                commentatorInfo: {
                    // @ts-ignore
                    userId: user.id,
                    // @ts-ignore
                    userLogin: user.login
                },
                createdAt: expect.any(String),
                likesInfo: {
                    likesCount: 0,
                    dislikesCount: 1,
                    myStatus: LikeStatus.DISLIKE
                }
            });
        })


        test('none like comment', async () => {
            await request(config.app)
                // @ts-ignore
                .put(`${config.url}/${comment.id}/like-status`)
                // @ts-ignore
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                // @ts-ignore
                .set('Cookie', [`refreshToken=${userAuthTokens.refreshToken}`])
                // @ts-ignore
                .send({
                    likeStatus: LikeStatus.NONE,
                })
                .expect(HTTP_STATUSES.NO_CONTENT_204);
        });

        test('check cancel likedislike comment', async () => {
            // config.app.request.cookies.refreshToken = userAuthTokens.refreshToken
            const postComments = await request(config.app)
                // @ts-ignore
                .get(`${postsConfig.url}/${post.id}/comments`)
                // @ts-ignoreW
                .auth(userAuthTokens.accessToken || 'None', { type: "bearer" })
                .expect(HTTP_STATUSES.OK_200)
            //
            expect(postComments.body.items.length).toBe(1);
            //
            comment = postComments.body.items[0];
            expect(comment).toEqual({
                id: expect.any(String),
                content: comment.content,
                commentatorInfo: {
                    // @ts-ignore
                    userId: user.id,
                    // @ts-ignore
                    userLogin: user.login
                },
                createdAt: expect.any(String),
                likesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: LikeStatus.NONE
                }
            });
        })
    });
});