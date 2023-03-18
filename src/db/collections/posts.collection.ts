import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: { type: String, require: false },
});

export const PostModel = mongoose.model('post', postSchema);