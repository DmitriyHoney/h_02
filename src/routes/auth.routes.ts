import { Router, Request, Response, NextFunction } from 'express';
import { authMiddlewareJWT, authBody as validatorMiddleware, authRegistration, authRegistrationConfirm, authRegistrationResend, authCheckValidRefreshJWT, secureToManyRequests } from '../middlewares/auth.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import { HTTP_STATUSES, ValidationErrors, VALIDATION_ERROR_MSG } from '../types/types';
import authDomain from '../domain/auth.domain';
import { jwtService } from '../helpers/jwt-service';
import { userMappersQuery, usersQueryRepo } from '../repositries/users.repositry';
import { emailManager } from '../managers/email.manager';
import { generateExpiredDate, generateUUID, getUserIp } from '../helpers';
import usersDomain from '../domain/users.domain';
import DeviceActiveSessionsDomain from '../domain/activeDeviceSessions.domain';
import { deviceActiveSessionsQueryRepo } from '../repositries/activeDeviceSessions.repositry';

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

router.post('/registration-confirmation', ...authRegistrationConfirm, secureToManyRequests, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const errorsCodeAlreadyActivatedOrExpired: ValidationErrors = {
        errorsMessages: [{ message: 'Code already activated or expired', field: 'code' }],
    };

    const errorsCodeNotValid: ValidationErrors = {
        errorsMessages: [{ message: 'Code not valid', field: 'code' }],
    };
    
    const user = await usersQueryRepo.findNoActUserByConfirmedCode(req.body.code);
    if (!user || user.confirmedInfo?.isConfirmedEmail) return res.status(400).send(errorsCodeAlreadyActivatedOrExpired);
    
    const isCodeValid = authDomain.isCodeConfirmationValid(req.body.code, user);
    if (!isCodeValid) return res.status(400).send(errorsCodeNotValid);
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

router.post('/login', ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await authDomain.login(req.body);
        if (!user) return res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();

        secureToManyRequests(req, res, next);
        const deviceId = generateUUID();
        const accessToken = jwtService.createJWT(user, '30m');
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

    await DeviceActiveSessionsDomain.update(tokenItem.id, { 
        ...tokenItem, 
        lastActiveDate: new Date().toISOString(),
        _expirationDate: generateExpiredDate({ hours: 1, min: 0, sec: 0 }).toISOString(),
    });

    const newAccessToken = jwtService.createJWT(user, '30m');
    const newRefreshToken = jwtService.createJWT(user, '60m', tokenItem.deviceId);

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
    res.status(HTTP_STATUSES.OK_200).send({ accessToken: newAccessToken });
});

router.get('/me', authMiddlewareJWT, async (req: Request, res: Response) => {
    if (!req.context?.user) return res.status(401).send();
    res.status(200).send(userMappersQuery.authMe(req.context.user));
});

export default router;