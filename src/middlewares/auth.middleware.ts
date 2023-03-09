import { body } from 'express-validator';
import { HTTP_STATUSES, VALIDATION_ERROR_MSG } from '../types/types';
import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../helpers/jwt-service';
import { usersQueryRepo } from '../repositries/users.repositry';
import { getUserIp, isEmail } from '../helpers';

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

// первоначальная basic проверка
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers?.authorization) return res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send('Not authorized');
  const [prefix, authInfo] = req.headers.authorization?.split(' ');
  if (prefix.trim() !== 'Basic') return res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send('Not authorized');
  const [login, pwd] = Buffer.from(authInfo, 'base64').toString().split(':');
  // @ts-ignore
  if (users[login] === pwd && login && pwd) {
    next();
  } else {
    return res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send('Not authorized');
  }
};

// продвинутая jwt проверка
export const authMiddlewareJWT = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    if (req?.context?.user) req.context.user = null;
    return res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();
  }
  const token = req.headers.authorization.split(' ')[1];
  const payload = jwtService.verifyToken(token);
  if (payload) {
    if (!req.context) req.context = { user: null, verifiedToken: null, userIP: undefined };
    // @ts-ignore
    req.context.user = await usersQueryRepo.findById(payload.userId);
    // req.context.deviceId = await usersQueryRepo.findById(payload.deviceId);
    next();
  } else {
    if (req?.context?.user) req.context.user = null;
    return res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();
  }
};

export const authCheckValidRefreshJWT = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();
  
  const verifiedToken = jwtService.verifyToken(refreshToken);
  if (!verifiedToken) return res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();

  const ip = getUserIp(req);
  if (!ip) return res.status(HTTP_STATUSES.BAD_REQUEST_400).send();

  if (!req.context) req.context = { user: null, verifiedToken: null, userIP: undefined };
  
  req.context.userIP = ip;
  // @ts-ignore
  req.context.verifiedToken = verifiedToken;
  next();
};