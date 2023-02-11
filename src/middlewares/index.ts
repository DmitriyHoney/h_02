import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError, ValidationErrors } from '../types/types';

const users = {
  admin: 'qwerty',
}

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

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers?.authorization) return res.status(401).send('Not authorized');
  const [prefix, authInfo] = req.headers.authorization?.split(' ');
  if (prefix.trim() !== 'Basic') return res.status(401).send('Not authorized');
  const [login, pwd] = Buffer.from(authInfo, 'base64').toString().split(':');
  // @ts-ignore
  if (users[login] === pwd && login && pwd) {
    next();
  } else {
    return res.status(401).send('Not authorized');
  }
}