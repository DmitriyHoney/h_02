import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

const users = {
  admin: 'qwerty',
}

export const validatorsErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // @ts-ignore
      const errorsMessages = [];
      errors.array().forEach((i) => {
        // @ts-ignore
        const findError = errorsMessages.findIndex((e) => e.field === i.param);
        if (findError < 0) errorsMessages.push({ message: i.msg, field: i.param });
      });
      // @ts-ignore
      return res.status(400).json({ errorsMessages });
    }
    next();
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers?.authorization) return res.status(401).send('Not authorized');
  const [prefix, authInfo] = req.headers.authorization?.split(' ');
  const [login, pwd] = Buffer.from(authInfo, 'base64').toString().split(':');
  // @ts-ignore
  if (users[login] === pwd && login && pwd && prefix.trim() === 'Basic') {
    next();
  } else {
    return res.status(401).send('Not authorized');
  }
}