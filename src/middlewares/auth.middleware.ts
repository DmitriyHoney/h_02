import { body } from 'express-validator';
import { HTTP_STATUSES, VALIDATION_ERROR_MSG } from '../types/types';
import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../helpers/jwt-service';
import { usersQueryRepo } from '../repositries/users.repositry';
import { generateExpiredDate, getUserIp, isEmail } from '../helpers';

const users = {
  admin: 'qwerty',
}

export const newPassAuthBody = [
  body('recoveryCode')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail(),
  body('newPassword')
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isString().withMessage(VALIDATION_ERROR_MSG.IS_STRING).bail()
    .trim()
    .notEmpty().withMessage(VALIDATION_ERROR_MSG.REQUIRED).bail()
    .isLength({ min: 6, max: 20 }).withMessage(VALIDATION_ERROR_MSG.OUT_OF_RANGE),
];


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
  req.context.user = await usersQueryRepo.findById(verifiedToken.userId);
  // @ts-ignore
  req.context.verifiedToken = verifiedToken;
  next();
};

export const getUserByRefreshJWT = async (req: Request, res: Response, next: NextFunction) => {
  if (req.context && req.context.user) return next();
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken && req.headers?.authorization) {
    // @ts-ignore
    const token = req.headers.authorization.split(' ')[1];
    const payload = jwtService.verifyToken(token);
    if (payload) {
      if (!req.context) req.context = { user: null, verifiedToken: null, userIP: undefined };
      // @ts-ignore
      req.context.user = await usersQueryRepo.findById(payload.userId);
      // req.context.deviceId = await usersQueryRepo.findById(payload.deviceId);
    }
    return next();
  }

  const verifiedToken = jwtService.verifyToken(refreshToken);
  if (!verifiedToken) return next();

  if (!req.context) req.context = { user: null, verifiedToken: null, userIP: undefined };
  // @ts-ignore
  req.context.user = await usersQueryRepo.findById(verifiedToken.userId);
  next();
};

const tempMethodsCount: any = {};

// TODO: перенести хранение подсчёта кол-ва запросов в базу
export const secureToManyRequests = async (req: Request, res: Response, next: NextFunction) => {
  const ip = getUserIp(req);
  const { url, method } = req;
  const key = `${ip} ${method} ${url}`;

  const initMeta = () => {
    tempMethodsCount[key] = { 
      count: 1, 
      blockedDate: generateExpiredDate({ hours: 0, min: 0, sec: 10 }).toISOString(), 
      updatedAt: new Date().toISOString() 
    };
  }
  
  if (!tempMethodsCount[key]) {
    initMeta();
    next();
    return;
  };

  tempMethodsCount[key].count++;
  
  if (isReqLastDateIsOut()) {
    initMeta();
    next();
    return;
  };
  
  tempMethodsCount[key].updatedAt = new Date().toISOString();
  tempMethodsCount[key].blockedDate = generateExpiredDate({ hours: 0, min: 0, sec: 10 }).toISOString();

  if (tempMethodsCount[key].count > 5) {
    const curDate = new Date();
    const lastMethodReqDate = new Date(tempMethodsCount[key].blockedDate);
    if (curDate < lastMethodReqDate) return res.status(HTTP_STATUSES.TOO_MANY_REQUESTS_429).send();
    delete tempMethodsCount[key];
  }
  
  next();
  
  function isReqLastDateIsOut() {
    const lastUpd = new Date(tempMethodsCount[key].updatedAt);
    const curDate = new Date();
    // @ts-ignore
    const diffSec = Math.abs(curDate - lastUpd) / 1000;
    return diffSec > 10;
  }
};