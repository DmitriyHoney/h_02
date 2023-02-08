import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

const users = {
  admin: 'qwerty',
}

export const validatorsErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsMessages = errors.array().map((i) => ({ message: i.msg, field: i.param }))
      return res.status(400).json({ errorsMessages });
    }
    next();
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers?.authorization) return res.status(401).send('Not authorized');
  const [, authInfo] = req.headers.authorization?.split(' ');
  const [login, pwd] = Buffer.from(authInfo, 'base64').toString().split(':');
  // @ts-ignore
  if (users[login] === pwd && login && pwd) {
    next();
  } else {
    return res.status(401).send('Not authorized');
  }
}