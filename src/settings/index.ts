export const settings = {
    JWT_SECRET: process?.env?.SECRET_KEY || 'secret',
    DB_NAME: process.env.DB_NAME || 'prod_db',
    DB_NAME_TEST: process.env.DB_NAME_TEST || 'test_db',
    PORT: process.env.PORT || 3000,
    PORT_TEST: process.env.PORT_TEST || 4000,
    DB_URL: process.env.DB_URL || 'mongodb://localhost:27017',
};