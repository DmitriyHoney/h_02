import request from 'supertest';
import { app, HTTP_STATUSES } from '../index';
import { Blog, BlogModel } from '../types/types';

describe('/products', () => {
    const testInvalidRow = { name: 'Apple', description: 'This is Apple' };
    const testValidRow: Blog = { description: 'test descr 1', name: 'test1', websiteUrl: 'https://ya.ru' };
    const testValidUpdateRow: Blog = { description: 'test descr 2', name: 'test 2', websiteUrl: 'https://ya.ru'  };
    const url = '/ht_02/api/blogs';
    const testDel = '/ht_02/api/testing/all-data/';
    let createdRow: BlogModel;
    beforeAll(async () => {
        await request(app).delete(testDel)
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
        await request(app)
            .post(url)
            .send(testInvalidRow)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await request(app)
            .get(url)
            .expect(HTTP_STATUSES.OK_200, [])
    });

    it('should create blog with correct input data', async () => {
        const result = await request(app)
            .post(url)
            .send(testValidRow)
            .expect(HTTP_STATUSES.CREATED_201)

        createdRow = result.body;
        expect(result.body).toEqual({
            id: expect.any(Number),
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
            id: expect.any(Number),
            name: testValidRow.name,
            description: testValidRow.description,
            websiteUrl: testValidRow.websiteUrl,
        });
    });

    it('should put blog', async () => {
        const result = await request(app)
            .put(`${url}/${createdRow.id}/`)
            .send(testValidUpdateRow)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        expect(result.body).toEqual({});
    });

    it('should delete blog', async () => {
        const result = await request(app)
            .delete(`${url}/${createdRow.id}/`)
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