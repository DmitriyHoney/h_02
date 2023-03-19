import mongoose from 'mongoose';
import { hashPassword, isEmail, isLogin } from '../../helpers';
import { VALIDATION_ERROR_MSG } from '../../types/types';
const { Schema } = mongoose;

// @ts-ignore
const userSchema = new Schema({
    login: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3, 
        maxLength: 10,
        validate: {
            validator: function(v: string) {
                return isLogin(v);
            },
            message: () => VALIDATION_ERROR_MSG.LOGIN_NOT_VALID_TEMPLATE
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v: string) {
                return isEmail(v);
            },
            message: () => VALIDATION_ERROR_MSG.EMAIL_NOT_VALID_TEMPLATE
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v: string) {
                return v.length >= 8;
            },
            message: () => VALIDATION_ERROR_MSG.OUT_OF_RANGE
        },
    },
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
    console.log(1111);
    if (!this.isNew && !this.isModified('password')) return next();
    try {
        const hash = await hashPassword(this.password);
        this.password = hash;
        return next();
    } catch {
        return next();
    }
});
export const UserModel = mongoose.model('User', userSchema);