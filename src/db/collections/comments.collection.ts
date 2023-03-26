import mongoose from "mongoose";
import {LikeStatus} from "../../types/types";

const commentSchema = new mongoose.Schema({
    title: String,
    shortDescription: String,
    content: String,
    postId: String,
    blogName: { type: String, require: false },
    commentatorInfo: {
        userId: {
            type: String,
        },
        userLogin: {
            type: String,
        }
    },
    likesInfo: {
        likesCount: {
            type: Number,
            default: 0,
            required: false
        },
        dislikesCount: {
            type: Number,
            default: 0,
            required: false
        },
        usersStatistics: {
            type: Object,
            default: {},
            required: false
        }
    }
}, { timestamps: true });

commentSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    delete object._id;
    delete object.__v;
    return object;
});

export const CommentModel = mongoose.model('Comment', commentSchema);