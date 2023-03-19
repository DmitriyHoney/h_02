import mongoose from 'mongoose';
import { hashPassword } from '../../helpers';
const { Schema } = mongoose;

// @ts-ignore
const userSchema = new Schema({
    login: String,
    email: String,
    password: String,
    confirmedInfo: {
        isConfirmedEmail: { type: Boolean, default: false },
        code: { type: String, default: '' },
        codeExpired: { type: String, default: '' },
    }
}, { timestamps: true });

userSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    delete object._id;
    delete object.__v;
    return object;
});
userSchema.pre('save', async function(next) {
    if (!this.isNew && !this.isModified('password')) return next();
    try {
        // @ts-ignore
        const hash = await hashPassword(this.password);
        this.password = hash;
        return next();
    } catch {
        return next();
    }
});
export const UserModel = mongoose.model('User', userSchema);