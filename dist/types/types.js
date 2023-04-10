"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeStatus = exports.HTTP_STATUSES = exports.VALIDATION_ERROR_MSG = void 0;
exports.VALIDATION_ERROR_MSG = {
    REQUIRED: 'Field is required',
    IS_STRING: 'Field must be a string',
    IS_NUMBER: 'Field must be a number',
    IS_BOOLEAN: 'Field must be a boolean',
    IS_URL: 'Field must be an url',
    OUT_OF_RANGE: 'Field is out of range',
    BLOG_ID_NOT_FOUND: 'Blog with blogId not found',
    LOGIN_NOT_VALID_TEMPLATE: 'Not valid pattern login',
    EMAIL_NOT_VALID_TEMPLATE: 'Not valid pattern email',
    EMAIL_OR_PASSWORD_NOT_VALID: 'Email or password not valid',
    USER_THIS_EMAIL_EXIST: 'User this email already exist',
    USER_THIS_LOGIN_EXIST: 'User this login already exist',
};
exports.HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_AUTHORIZED_401: 401,
    FORBIDDEN_403: 403,
    NOT_FOUND_404: 404,
    TOO_MANY_REQUESTS_429: 429,
    SERVER_ERROR_500: 500,
};
var LikeStatus;
(function (LikeStatus) {
    LikeStatus["NONE"] = "None";
    LikeStatus["LIKE"] = "Like";
    LikeStatus["DISLIKE"] = "Dislike";
})(LikeStatus = exports.LikeStatus || (exports.LikeStatus = {}));
