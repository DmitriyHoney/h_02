import { Router, Request, Response, NextFunction } from 'express';
import { 
    authMiddlewareJWT, 
    authBody as validatorMiddleware, 
    authRegistration, authRegistrationConfirm, authRegistrationResend, 
    authCheckValidRefreshJWT, secureToManyRequests, newPassAuthBody
} from '../middlewares/auth.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import { HTTP_STATUSES, ValidationErrors, VALIDATION_ERROR_MSG, Pwd } from '../types/types';
import authDomain from '../domain/auth.domain';
import { jwtService } from '../helpers/jwt-service';
import { userMappersQuery, usersQueryRepo } from '../repositries/users.repositry';
import { emailManager } from '../managers/email.manager';
import { generateExpiredDate, generateUUID, getUserIp, hashPassword } from '../helpers';
import usersDomain from '../domain/users.domain';
import DeviceActiveSessionsDomain from '../domain/activeDeviceSessions.domain';
import { deviceActiveSessionsQueryRepo } from '../repositries/activeDeviceSessions.repositry';
import pwdDomain from '../domain/pwd.domain';
import { pwdQueryRepo, pwdCommandRepo } from '../repositries/pwd.repositry';

const router = Router();

router.post('/registration', ...authRegistration, secureToManyRequests, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const confirmedInfo = { 
        code: generateUUID(), codeExpired: generateExpiredDate({ hours: 1, min: 0, sec: 0 }).toISOString(), isConfirmedEmail: false 
    };
    try {
        await usersDomain.create({ ...req.body, confirmedInfo });
        await emailManager.sendRegCodeConfirm(req.body.email, confirmedInfo.code);
        res.status(204).send();
    } catch (e) {
        const notUserThisEmailOrLogin = [VALIDATION_ERROR_MSG.USER_THIS_EMAIL_EXIST, VALIDATION_ERROR_MSG.USER_THIS_LOGIN_EXIST];
        const errMsg = (e as Error).message;
        return notUserThisEmailOrLogin.includes(errMsg)
            ? res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
                errorsMessages: [{ field: errMsg.indexOf('login') >= 0 ? 'login' : 'email', message: errMsg }]
              })
            : res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errMsg);
    }
});

router.post('/password-recovery', ...authRegistrationResend, authCheckValidRefreshJWT, secureToManyRequests, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const confirmedInfo: Pwd = { 
        code: generateUUID(), expiredDate: generateExpiredDate({ hours: 1, min: 0, sec: 0 }).toISOString(), email: req.body.email, isActive: false,
    };
    try {
        pwdDomain.create(confirmedInfo);
        await emailManager.sendRecoverPassCodeConfirm(req.body.email, confirmedInfo.code);
        res.status(204).send();
    } catch (e) {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).send({});
    }
});

router.post('/new-password', ...newPassAuthBody, secureToManyRequests, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    try {
        const codeInDb = await pwdQueryRepo.findByCode(req.body.recoveryCode);
        
        if (!codeInDb) {
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
                errorsMessages: [
                    { field: 'recoveryCode', message: 'Incorrect recoveryCode'}
                ]
            } as ValidationErrors);
        }
        if (codeInDb.isActive) {
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
                errorsMessages: [
                    { field: 'recoveryCode', message: 'Code already in use'}
                ]
            } as ValidationErrors);
        }
        const isCodeValid = pwdDomain.isCodeConfirmationValid(codeInDb.expiredDate);
        if (!isCodeValid) {
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
                errorsMessages: [
                    { field: 'recoveryCode', message: 'RecoveryCode is expired'}
                ]
            } as ValidationErrors);
        }
        const user = await usersQueryRepo.findUserByEmail(codeInDb.email);
        const password = await hashPassword(req.body.newPassword);
        const userUpdated = { password };
        // @ts-ignore
        await usersDomain.update(user?.id, userUpdated);
        await pwdCommandRepo.update(codeInDb.id, { ...codeInDb, isActive: true });
        return res.status(HTTP_STATUSES.NO_CONTENT_204).send({});
    } catch (e) {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).send({});
    }
});

router.post('/password-recovery', ...authRegistrationResend, secureToManyRequests, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const code = generateUUID();
    try {
        await emailManager.sendRecoverPassCodeConfirm(req.body.email, code);
        res.status(204).send();
    } catch (e) {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).send({});
    }
});


router.post('/registration-confirmation', ...authRegistrationConfirm, secureToManyRequests, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const errorsCodeAlreadyActivatedOrExpired: ValidationErrors = {
        errorsMessages: [{ message: 'Code already activated or expired', field: 'code' }],
    };

    const errorsCodeNotValid: ValidationErrors = {
        errorsMessages: [{ message: 'Code not valid', field: 'code' }],
    };
    
    const user = await usersQueryRepo.findNoActUserByConfirmedCode(req.body.code);
    if (!user || user.confirmedInfo?.isConfirmedEmail) return res.status(400).send(errorsCodeAlreadyActivatedOrExpired);
    // @ts-ignore
    const isCodeValid = authDomain.isCodeConfirmationValid(req.body.code, user);
    if (!isCodeValid) return res.status(400).send(errorsCodeNotValid);
    // @ts-ignore
    const isWasUpdated = await usersDomain.update(user.id, { 
        ...user, 
        confirmedInfo: { code: '', codeExpired: '', isConfirmedEmail: true }
    });
    return isWasUpdated ? res.status(204).send() : res.status(400).send();
});

router.post('/registration-email-resending', ...authRegistrationResend, secureToManyRequests, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const expiredDate = new Date();
    expiredDate.setHours(expiredDate.getHours() + 1);
    const user = await usersQueryRepo.findUserByEmail(req.body.email);
    if (!user) return res.status(400).send({
        errorsMessages: [{ message: 'User this email not found', field: 'email' }],
    });
    const errorsEmailAlreadyConfirmed: ValidationErrors = {
        errorsMessages: [{ message: 'Email already confirmed', field: 'email' }],
    };
    if (user.confirmedInfo?.isConfirmedEmail) return res.status(400).send(errorsEmailAlreadyConfirmed);
    try {
        const confirmedCode = generateUUID();
        // @ts-ignore
        await usersDomain.update(user.id, {
            ...user,
            confirmedInfo: {
                code: confirmedCode,
                codeExpired: expiredDate.toISOString(),
                isConfirmedEmail: false,
            }
        });

        const info = await emailManager.sendRegCodeConfirm(req.body.email, confirmedCode);
        res.status(204).send();
    } catch (e) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).send();
    }
});

router.post('/login', ...validatorMiddleware, secureToManyRequests, validatorsErrorsMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await authDomain.login(req.body);
        if (!user) return res.status(HTTP_STATUSES.TOO_MANY_REQUESTS_429).send();

        const deviceId = generateUUID();
        // @ts-ignore
        const accessToken = jwtService.createJWT(user, '30m');
        // @ts-ignore
        const refreshToken = jwtService.createJWT(user, '60m', deviceId);
        
        const ip = getUserIp(req);
        if (!ip) return res.status(HTTP_STATUSES.BAD_REQUEST_400).send();
        
        await DeviceActiveSessionsDomain.create({ 
            ip,
            title: req.get('User-Agent') || 'user agent unknown',
            lastActiveDate: new Date().toISOString(),
            deviceId,
            _expirationDate: generateExpiredDate({ hours: 1, min: 0, sec: 0 }).toISOString(),
            _userId: user.id,
        });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        res.status(HTTP_STATUSES.OK_200).send({ accessToken });
    } catch(e) {
        if ((e as Error).message === VALIDATION_ERROR_MSG.EMAIL_OR_PASSWORD_NOT_VALID) {
            res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();
        } else res.status(HTTP_STATUSES.BAD_REQUEST_400).send();
    }
});

router.post('/logout', authCheckValidRefreshJWT, async (req: Request, res: Response) => {
    const { userIP, verifiedToken } = req.context;
    // @ts-ignore
    const tokenItem = await deviceActiveSessionsQueryRepo.findByIpAndDeviceId(userIP, verifiedToken?.deviceId);
    if (!tokenItem) return res.status(401).send();

    // @ts-ignore
    const isDel = await DeviceActiveSessionsDomain.deleteOne(tokenItem.id);
    
    if (!isDel) return res.status(401).send();
    return res.status(204).send();
});

router.post('/refresh-token', authCheckValidRefreshJWT, async (req: Request, res: Response) => {
    const { userIP, verifiedToken } = req.context;
    
    // @ts-ignore
    const tokenItem = await deviceActiveSessionsQueryRepo.findByIpAndDeviceId(userIP, verifiedToken?.deviceId);
    if (!tokenItem) return res.status(401).send();

    // @ts-ignore
    const user = await usersQueryRepo.findById(req.context.verifiedToken?.userId);
    if (!user) return res.status(401).send();

    console.log('tokenItem', tokenItem);
    // @ts-ignore
    await DeviceActiveSessionsDomain.update(tokenItem.id, { 
        ...tokenItem, 
        lastActiveDate: new Date().toISOString(),
        _expirationDate: generateExpiredDate({ hours: 1, min: 0, sec: 0 }).toISOString(),
    });

    const newAccessToken = jwtService.createJWT(user, '30m');
    // @ts-ignore
    const newRefreshToken = jwtService.createJWT(user, '60m', tokenItem.deviceId);

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
    res.status(HTTP_STATUSES.OK_200).send({ accessToken: newAccessToken });
});

router.get('/me', authMiddlewareJWT, async (req: Request, res: Response) => {
    if (!req.context?.user) return res.status(401).send();
    // @ts-ignore
    res.status(200).send(userMappersQuery.authMe(req.context.user));
});

export default router;