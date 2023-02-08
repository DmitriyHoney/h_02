import request from 'supertest';
import { app, HTTP_STATUSES } from '../index';
import { Blog, BlogModel } from '../types/types';

describe('/blogs', () => {
    const testInvalidRow = { name: 'Apple', description: 'This is Apple' };
    const testValidRow: Blog = { description: 'test descr 1', name: 'test1', websiteUrl: 'https://ya.ru' };
    const testValidUpdateRow: Blog = { description: 'test descr 2', name: 'test 2', websiteUrl: 'https://ya.ru'  };
    const url = '/api/blogs';
    const testDel = '/api/testing/all-data/';
    let createdRow: BlogModel;

    // @ts-ignore
    const requestWithHeader = (method, args) => request(app)[method](args).set('Authorization', 'Basic YWRtaW46cXdlcnR5');
    // @ts-ignore
    const requestIncorrectHeader = (method, args) => request(app)[method](args).set('Authorization', 'Basic YWRtaW46cXdlfdsf5');

    beforeAll(async () => {
        await request(app).delete(testDel);
    });

    it('should return 200 and empty array', async () => {
        await request(app)
            .get(url)
            .expect(HTTP_STATUSES.OK_200, [])
    });

    it('should return 404 for not found blog', async () => {
        await request(app)
            .get(`${url}/825`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    });

    it('shouldn`t create blog with incorrect input data', async () => {
        await requestWithHeader('post', url)
            .send(testInvalidRow)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await request(app)
            .get(url)
            .expect(HTTP_STATUSES.OK_200, [])
    });

    it('should create blog with correct input data', async () => {
        const result = await requestWithHeader('post', url)
            .send(testValidRow)
            .expect(HTTP_STATUSES.CREATED_201)

        createdRow = result.body;
        expect(result.body).toEqual({
            id: expect.any(String),
            name: testValidRow.name,
            description: testValidRow.description,
            websiteUrl: testValidRow.websiteUrl,
        });

        await request(app)
            .get(url)
            .expect(HTTP_STATUSES.OK_200, [createdRow])
    });

    it('should get blog by id', async () => {
        const result = await request(app)
            .get(`${url}/${createdRow.id}/`)
            .expect(HTTP_STATUSES.OK_200, createdRow)

        expect(result.body).toEqual({
            id: expect.any(String),
            name: testValidRow.name,
            description: testValidRow.description,
            websiteUrl: testValidRow.websiteUrl,
        });
    });

    it('should put blog', async () => {
        const result = await requestWithHeader('put', `${url}/${createdRow.id}/`)
            .send(testValidUpdateRow)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        expect(result.body).toEqual({});
    });

    it('should delete blog', async () => {
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