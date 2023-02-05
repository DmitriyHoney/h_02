import { AvailableResolutionType } from "../types/types";
import { isPayloadValid } from './core';


const videoSchema = {
    createdAt: { type: 'date', required: false, default: '_:_:_T_:_:_' },
    title: { type: 'string', required: true, maxLength: 40 },
    author: { type: 'string', required: true, maxLength: 20 },
    canBeDownloaded: { type: 'boolean', required: false, default: false },
    availableResolutions: { type: 'enum', required: false, condition: Object.values(AvailableResolutionType), default: null },
    minAgeRestriction: { type: 'number', required: false, default: null, condition: [1, 18] },
    publicationDate: { type: 'date', required: false, default: '_:_:1T_:_:_', dep: 'createdAt' },
}

export const isVideoPayloadValid = (payload: Object) => isPayloadValid(payload, videoSchema);
