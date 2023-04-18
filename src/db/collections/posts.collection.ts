import mongoose from "mongoose";
import {LastPostLikes, LikeStatus} from "../../types/types";

const postSchema = new mongoose.Schema({
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: { type: String, require: false },
    extendedLikesInfo: {
        likesCount: Number,
        dislikesCount: Number,
        myStatus: String,
        newestLikes: [],
    }
}, { timestamps: true });

postSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    delete object._id;
    delete object.__v;
    return object;
});

export const PostModel = mongoose.model('Post', postSchema);