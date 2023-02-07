export type BaseDbEntity = { id: number };

export type Blog = {
    name: string,
    description: string,
    websiteUrl: string
}

export type Post = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
}

export type BlogModel = BaseDbEntity & Blog;
export type PostModel = BaseDbEntity & Post;