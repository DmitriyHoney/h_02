import request from 'supertest';
import { app, HTTP_STATUSES } from '../index';
import { Product, ProductModel } from '../types/db.types';

describe('/products', () => {
    const testInvalidRow = { name: 'Apple', description: 'This is Apple' };
    const testValidRow: Product = { title: 'Orange', description: 'This is Orange' };
    const testValidUpdateRow: Product = { title: 'Orange1', description: 'This is Orange1' };
    let createdRow: ProductModel;
    beforeAll(async () => {
        await request(app)
            .delete('/api/v1/products/__test__/data/')
    });

    it('should return 200 and empty array', async () => {
        await request(app)
            .get('/api/v1/products/')
            .expect(HTTP_STATUSES.OK_200, [])
    });

    it('should return 404 for not found product', async () => {
        await request(app)
            .get('/api/v1/products/1/')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    });

    it('shouldn`t create product with incorrect input data', async () => {
        await request(app)
            .post('/api/v1/products/')
            .send(testInvalidRow)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await request(app)
            .get('/api/v1/products/')
            .expect(HTTP_STATUSES.OK_200, [])
    });

    it('should create product with correct input data', async () => {
        const result = await request(app)
            .post('/api/v1/products/')
            .send(testValidRow)
            .expect(HTTP_STATUSES.CREATED_201)

        createdRow = result.body;
        expect(result.body).toEqual({
            id: expect.any(Number),
            createdAt: expect.any(String),
            title: testValidRow.title,
            description: testValidRow.description,
        });

        await request(app)
            .get('/api/v1/products/')
            .expect(HTTP_STATUSES.OK_200, [createdRow])
    });

    it('should get product by id', async () => {
        const result = await request(app)
            .get(`/api/v1/products/${createdRow.id}/`)
            .expect(HTTP_STATUSES.OK_200, createdRow)

        expect(result.body).toEqual({
            id: expect.any(Number),
            createdAt: expect.any(String),
            title: testValidRow.title,
            description: testValidRow.description,
        });
    });

    it('should put product', async () => {
        const result = await request(app)
            .put(`/api/v1/products/${createdRow.id}/`)
            .send(testValidUpdateRow)
            .expect(HTTP_STATUSES.OK_200);

        expect(result.body).toEqual({
            id: expect.any(Number),
            createdAt: expect.any(String),
            title: testValidUpdateRow.title,
            description: testValidUpdateRow.description,
        });
    });

    it('should delete product', async () => {
        const result = await request(app)
            .delete(`/api/v1/products/${createdRow.id}/`)
            .send(createdRow)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request(app)
            .get(`/api/v1/products/${createdRow.id}/`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
        
        await request(app)
            .get('/api/v1/products/')
            .expect(HTTP_STATUSES.OK_200, [])
    });
});