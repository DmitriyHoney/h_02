export const VALIDATION_ERROR_MSG = {
    REQUIRED: 'Field is required',
    IS_STRING: 'Field must be a string',
    IS_NUMBER: 'Field must be a number',
    IS_BOOLEAN: 'Field must be a boolean',
    IS_URL: 'Field must be an url',
    OUT_OF_RANGE: 'Field is out of range',
    BLOG_ID_NOT_FOUND: 'Blog with blogId not found',
    LOGIN_NOT_VALID_TEMPLATE: 'Not valid pattern login, must be ^[a-zA-Z0-9_-]*$',
    EMAIL_NOT_VALID_TEMPLATE: 'Not valid pattern email, must be ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
    EMAIL_OR_PASSWORD_NOT_VALID: 'Email or password not valid',
    USER_THIS_EMAIL_EXIST: 'User this email already exist',
    USER_THIS_LOGIN_EXIST: 'User this login already exist',
};

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_AUTHORIZED_401: 401,
    FORBIDDEN_403: 403,
    NOT_FOUND_404: 404,
    SERVER_ERROR_500: 500,
};

export type ValidationError = { message: string, field: String }

export type ValidationErrors = {
    errorsMessages: Array<ValidationError>
}

export type PaginationSortingType<I> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: Array<I>
}

export type BaseDbEntity = { id: string, createdAt: string };

export type Blog = {
    name: string,
    description: string,
    websiteUrl: string,
    isMembership?: boolean
}

export type Post = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName?: string,
}

export type User = {
    login: string,
    email: string,
    password: string,
}

export type BaseGetQueryParams = {
    pageSize?: string,
    pageNumber?: string,
    sortBy?: string,
    sortDirection?: string
}

export type AuthBody = {
    loginOrEmail: string,
    password: string
}

export type CommentatorInfo = {
    userId: string,
    userLogin: string,
}

export type Comment = {
    content: string,
    commentatorInfo?: CommentatorInfo,
}


export type BlogModel = BaseDbEntity & Blog;
export type PostModel = BaseDbEntity & Post;
export type UserModel = BaseDbEntity & User;
export type CommentModel = BaseDbEntity & Comment;