"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
describe('/posts', () => {
    const testInvalidRow = { blogId: '122', blogName: 't1', content: 'cnt1' };
    const testValidRow = { blogId: '122', blogName: 't1', content: 'cnt1', shortDescription: 'short1', title: 't1' };
    const testValidUpdateRow = { blogId: '122', blogName: 't2', content: 'cnt2', shortDescription: 'short2', title: 't2' };
    const url = '/api/posts';
    const testDel = '/api/testing/all-data/';
    let createdRow;
    // @ts-ignore
    const requestWithHeader = (method, args) => (0, supertest_1.default)(index_1.app)[method](args).set('Authorization', 'Basic YWRtaW46cXdlcnR5');
    // @ts-ignore
    const requestIncorrectHeader = (method, args) => (0, supertest_1.default)(index_1.app)[method](args).set('Authorization', 'Basic YWRtaW46cXdlfdsf5');
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app).delete(testDel);
    }));
    it('should return 200 and empty array', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app)
            .get(url)
            .expect(index_1.HTTP_STATUSES.OK_200, []);
    }));
    it('should return 404 for not found post', () => __awaiter(void 0, void 0, void 0, function* () {
        yield requestWithHeader('get', `${url}/825`)
            .expect(index_1.HTTP_STATUSES.NOT_FOUND_404);
    }));
    it('shouldn`t create post with incorrect input data', () => __awaiter(void 0, void 0, void 0, function* () {
        yield requestWithHeader('post', url)
            .send(testInvalidRow)
            .expect(index_1.HTTP_STATUSES.BAD_REQUEST_400);
        yield (0, supertest_1.default)(index_1.app)
            .get(url)
            .expect(index_1.HTTP_STATUSES.OK_200, []);
    }));
    it('shouldn`t create post with not Basic Auth', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app)
            .post(url)
            .send(testInvalidRow)
            .expect(index_1.HTTP_STATUSES.NOT_AUTHORIZED_401);
        yield (0, supertest_1.default)(index_1.app)
            .get(url)
            .expect(index_1.HTTP_STATUSES.OK_200, []);
    }));
    it('should create post with correct input data', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield requestWithHeader('post', url)
            .send(testValidRow)
            .expect(index_1.HTTP_STATUSES.CREATED_201);
        createdRow = result.body;
        expect(result.body).toEqual({
            id: expect.any(String),
            blogId: testValidRow.blogId,
            content: testValidRow.content,
            blogName: testValidRow.blogName,
            shortDescription: testValidRow.shortDescription,
            title: testValidRow.title,
        });
        yield (0, supertest_1.default)(index_1.app)
            .get(url)
            .expect(index_1.HTTP_STATUSES.OK_200, [createdRow]);
    }));
    it('should get post by id', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield requestWithHeader('get', `${url}/${createdRow.id}/`)
            .send(testValidRow)
            .expect(index_1.HTTP_STATUSES.OK_200, createdRow);
        expect(result.body).toEqual({
            id: expect.any(String),
            blogId: testValidRow.blogId,
            content: testValidRow.content,
            blogName: testValidRow.blogName,
            shortDescription: testValidRow.shortDescription,
            title: testValidRow.title,
        });
    }));
    it('should put post', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield requestWithHeader('put', `${url}/${createdRow.id}/`)
            .send(testValidUpdateRow)
            .expect(index_1.HTTP_STATUSES.NO_CONTENT_204);
        expect(result.body).toEqual({});
    }));
    it('should delete post', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield requestWithHeader('delete', `${url}/${createdRow.id}/`)
            .send(createdRow)
            .expect(index_1.HTTP_STATUSES.NO_CONTENT_204);
        yield (0, supertest_1.default)(index_1.app)
            .get(`${url}/${createdRow.id}/`)
            .expect(index_1.HTTP_STATUSES.NOT_FOUND_404);
        yield (0, supertest_1.default)(index_1.app)
            .get(url)
            .expect(index_1.HTTP_STATUSES.OK_200, []);
    }));
});
