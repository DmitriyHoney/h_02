import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError, ValidationErrors } from '../types/types';

export const validatorsErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const transformErrors: Array<ValidationError> = errors.array()
        .map(({ msg, param }) => ({ message: msg, field: param }));
      const errorsJSON: ValidationErrors = { errorsMessages: transformErrors };
      return res.status(400).json(errorsJSON);
    }
    next();
};