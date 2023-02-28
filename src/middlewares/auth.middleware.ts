import { body } from 'express-validator';
import { VALIDATION_ERROR_MSG } from '../types/types';
import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../helpers/jwt-service';
import { usersQueryRepo } from '../repositries/users.repositry';
import { isEmail } from '../helpers';

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
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isLength({ min: 6, max: 20 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
];

export const authRegistration = [
  body('login')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isLength({ min: 3, max: 11 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
  body('password')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isLength({ min: 6, max: 20 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
  body('email')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .custom((value) => {
      if (!isEmail(value)) throw new Error(VALIDATION_ERROR_MSG.EMAIL_NOT_VALID_TEMPLATE);
      return true;
    }),
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
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .custom((value) => {
      if (!isEmail(value)) throw new Error(VALIDATION_ERROR_MSG.EMAIL_NOT_VALID_TEMPLATE);
      return true;
    }),
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