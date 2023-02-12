export const VALIDATION_ERROR_MSG = {
    REQUIRED: 'Field is required',
    IS_STRING: 'Field must be a string',
    IS_NUMBER: 'Field must be a number',
    IS_BOOLEAN: 'Field must be a boolean',
    IS_URL: 'Field must be an url',
    OUT_OF_RANGE: 'Field is out of range',
    BLOG_ID_NOT_FOUND: 'Blog with blogId not found'
};

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_AUTHORIZED_401: 401,
    NOT_FOUND_404: 404,
    SERVER_ERROR_500: 500,
};

export type ValidationError = { message: string, field: String }

export type ValidationErrors = {
    errorsMessages: Array<ValidationError>
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

export type BlogModel = BaseDbEntity & Blog;
export type PostModel = BaseDbEntity & Post;