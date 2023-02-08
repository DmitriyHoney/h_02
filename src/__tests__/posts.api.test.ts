import request from 'supertest';
import { app, HTTP_STATUSES } from '../index';
import { Post, PostModel } from '../types/types';

describe('/posts', () => {
    const testInvalidRow = { blogId: '122', blogName: 't1', content: 'cnt1' };
    const testValidRow: Post = { blogId: '122', blogName: 't1', content: 'cnt1', shortDescription: 'short1', title: 't1' };
    const testValidUpdateRow: Post = { blogId: '122', blogName: 't2', content: 'cnt2', shortDescription: 'short2', title: 't2'  };
    const url = '/api/posts';
    const testDel = '/api/testing/all-data/';
    let createdRow: PostModel;

    // @ts-ignore
    const requestWithHeader = (method, args) => request(app)[method](args).set('Authorization', 'Basic YWRtaW46cXdlcnR5');
    // @ts-ignore
    const requestIncorrectHeader = (method, args) => request(app)[method](args).set('Authorization', 'Basic YWRtaW46cXdlfdsf5');

    beforeAll(async () => {
        await request(app).delete(testDel)
    });

    it('should return 200 and empty array', async () => {
        await request(app)
            .get(url)
            .expect(HTTP_STATUSES.OK_200, [])
    });

    it('should return 404 for not found post', async () => {
        await requestWithHeader('get', `${url}/825`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    });

    it('shouldn`t create post with incorrect input data', async () => {
        await requestWithHeader('post', url)
            .send(testInvalidRow)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await request(app)
            .get(url)
            .expect(HTTP_STATUSES.OK_200, [])
    });

    it('shouldn`t create post with not Basic Auth', async () => {
        await request(app)
            .post(url)
            .send(testInvalidRow)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        await request(app)
            .get(url)
            .expect(HTTP_STATUSES.OK_200, [])
    });

    it('should create post with correct input data', async () => {
        const result = await requestWithHeader('post', url)
            .send(testValidRow)
            .expect(HTTP_STATUSES.CREATED_201)

        createdRow = result.body;
        expect(result.body).toEqual({
            id: expect.any(Number),
            blogId: testValidRow.blogId,
            content: testValidRow.content,
            blogName: testValidRow.blogName,
            shortDescription: testValidRow.shortDescription,
            title: testValidRow.title,
        });

        await request(app)
            .get(url)
            .expect(HTTP_STATUSES.OK_200, [createdRow])
    });

    it('should get post by id', async () => {
        const result = await requestWithHeader('get', `${url}/${createdRow.id}/`)
            .send(testValidRow)
            .expect(HTTP_STATUSES.OK_200, createdRow)

        expect(result.body).toEqual({
            id: expect.any(Number),
            blogId: testValidRow.blogId,
            content: testValidRow.content,
            blogName: testValidRow.blogName,
            shortDescription: testValidRow.shortDescription,
            title: testValidRow.title,
        });
    });

    it('should put post', async () => {
        const result = await requestWithHeader('put', `${url}/${createdRow.id}/`)
            .send(testValidUpdateRow)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        expect(result.body).toEqual({});
    });

    it('should delete post', async () => {
        const result = await requestWithHeader('delete', `${url}/${createdRow.id}/`)
            .send(createdRow)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request(app)
            .get(`${url}/${createdRow.id}/`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
        
        await request(app)
            .get(url)
            .expect(HTTP_STATUSES.OK_200, [])
    });
});