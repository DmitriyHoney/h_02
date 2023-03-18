import mongoose from 'mongoose';
import { isEmail, isLogin } from '../../helpers';
import { VALIDATION_ERROR_MSG } from '../../types/types';
const { Schema } = mongoose;

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
            message: (props: any) => VALIDATION_ERROR_MSG.LOGIN_NOT_VALID_TEMPLATE
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
            message: (props: any) => VALIDATION_ERROR_MSG.EMAIL_NOT_VALID_TEMPLATE
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    confirmedInfo: {
        isConfirmedEmail: { type: Boolean, default: false },
        code: { type: String, default: '' },
        codeExpired: { type: String, default: '' },
    }
}, { timestamps: true });

userSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    },
});

export const UserModel = mongoose.model('User', userSchema);