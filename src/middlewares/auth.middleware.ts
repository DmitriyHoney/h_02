import { body } from 'express-validator';
import { VALIDATION_ERROR_MSG } from '../types/types';
import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../helpers/jwt-service';
import { usersQueryRepo } from '../repositries/users.repositry';

const users = {
  admin: 'qwerty',
}

export const authBody = [
  body('loginOrEmail')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail(),
  body('password')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail(),
];

export const authRegistration = [
  body('login')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail(),
  body('password')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail(),
  body('email')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail(),
];

export const authRegistrationConfirm = [
  body('code')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail(),
];

export const authRegistrationResend = [
  body('email')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail(),
];


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
};

export const authMiddlewareJWT = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    if (req?.context?.user) req.context.user = null;
    return res.status(401).send();
  }
  const token = req.headers.authorization.split(' ')[1];
  const payload = jwtService.getUserIdByToken(token);
  if (payload) {
    if (!req.context) req.context = { user: null };
    // @ts-ignore
    req.context.user = await usersQueryRepo.findById(payload.userId);
    next();
  } else {
    if (req?.context?.user) req.context.user = null;
    return res.status(401).send();
  }
};