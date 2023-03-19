import mongoose from "mongoose";

const pwdSchema = new mongoose.Schema({
    code: String,
    expiredDate: String,
    email: String,
    isActive: {
        type: Boolean,
        required: false,
        default: false,
    },
}, { timestamps: true });

pwdSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    delete object._id;
    delete object.__v;
    return object;
});

export const RecreatePwdModel = mongoose.model('Pwdcode', pwdSchema);