import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: { type: String, require: false },
}, { timestamps: true });

commentSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    delete object._id;
    delete object.__v;
    return object;
});

export const CommentModel = mongoose.model('Comment', commentSchema);