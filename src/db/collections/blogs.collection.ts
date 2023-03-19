import mongoose from 'mongoose';
import { isUrl } from '../../helpers';
import { VALIDATION_ERROR_MSG } from '../../types/types';
const { Schema } = mongoose;

// @ts-ignore
const blogSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2, 
        maxLength: 15,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: 2, 
        maxLength: 500,
    },
    websiteUrl: {
        type: String,
        required: true,
        trim: true,
        minLength: 2, 
        maxLength: 100,
        validate: {
            validator: function(v: string) {
                return isUrl(v);
            },
            message: () => VALIDATION_ERROR_MSG.IS_URL
        },
    },
    isMembership: {
        type: Boolean,
        required: false,
        default: false,
    }
}, { timestamps: true });

blogSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    delete object._id;
    delete object.__v;
    return object;
});
export const BlogModel = mongoose.model('Blog', blogSchema);