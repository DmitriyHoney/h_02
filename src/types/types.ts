export type BaseDbEntity = { id: number };

export type Blog = {
    name: string,
    description: string,
    websiteUrl: string
}

export type BlogModel = BaseDbEntity & Blog;