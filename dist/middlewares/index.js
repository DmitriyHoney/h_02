"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorsErrorsMiddleware = void 0;
const express_validator_1 = require("express-validator");
const validatorsErrorsMiddleware = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const transformErrors = errors.array()
            .map(({ msg, param }) => ({ message: msg, field: param }));
        const errorsJSON = { errorsMessages: transformErrors };
        return res.status(400).json(errorsJSON);
    }
    next();
};
exports.validatorsErrorsMiddleware = validatorsErrorsMiddleware;
