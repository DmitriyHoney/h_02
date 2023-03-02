import { Router, Request, Response } from 'express';
import { authMiddlewareJWT, authBody as validatorMiddleware, authRegistration, authRegistrationConfirm, authRegistrationResend } from '../middlewares/auth.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import { HTTP_STATUSES, ValidationErrors, VALIDATION_ERROR_MSG } from '../types/types';
import authDomain from '../domain/auth.domain';
import { jwtService } from '../helpers/jwt-service';
import { userMappersQuery, usersQueryRepo } from '../repositries/users.repositry';
import { emailManager } from '../managers/email.manager';
import { generateExpiredDate, generateUUID } from '../helpers';
import usersDomain from '../domain/users.domain';
import refreshTokensDomain from '../domain/refresh-tokens.domain';
import { refreshTokensQueryRepo } from '../repositries/refresh-tokens.repositry';

const router = Router();

router.post('/registration', ...authRegistration, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const confirmedInfo = { 
        code: generateUUID(), codeExpired: generateExpiredDate({ hours: 1 }).toISOString(), isConfirmedEmail: false 
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

router.post('/registration-confirmation', ...authRegistrationConfirm, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
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

router.post('/registration-email-resending', ...authRegistrationResend, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
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

router.post('/login', ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    try {
        const isUserSuccessAuth = await authDomain.login(req.body);
        if (!isUserSuccessAuth) {
            res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();
            return;
        }
        const accessToken = jwtService.createJWT(isUserSuccessAuth, '10s');
        const refreshToken = jwtService.createJWT(isUserSuccessAuth, '20s');
        await refreshTokensDomain.create({ token: refreshToken, wasUsed: false });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
        res.status(HTTP_STATUSES.OK_200).send({ accessToken });
    } catch(e) {
        if ((e as Error).message === VALIDATION_ERROR_MSG.EMAIL_OR_PASSWORD_NOT_VALID) {
            res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();
        } else res.status(HTTP_STATUSES.BAD_REQUEST_400).send();
    }
});

router.post('/logout', async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).send();
    const isJwtNotExpired = jwtService.getUserIdByToken(refreshToken);

    if (!isJwtNotExpired) return res.status(401).send();

    const tokenItem = await refreshTokensQueryRepo.findByToken(refreshToken);
    if (!tokenItem || tokenItem?.wasUsed) return res.status(401).send();
    // @ts-ignore
    const isDel = await refreshTokensDomain.deleteOne(tokenItem.id);
    
    if (!isDel) return res.status(401).send();
    return res.status(204).send();
});

router.post('/refresh-token', async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).send();
    const isJwtNotExpired = jwtService.getUserIdByToken(refreshToken);

    if (!isJwtNotExpired) return res.status(401).send();

    const tokenItem = await refreshTokensQueryRepo.findByToken(refreshToken);
    
    if (!tokenItem || tokenItem.wasUsed) return res.status(401).send();

    // @ts-ignore
    const user = await usersQueryRepo.findById(isJwtNotExpired.userId);
    if (!user) return res.status(401).send();

    await refreshTokensDomain.update(tokenItem.id, { ...tokenItem, wasUsed: true });

    const newAccessToken = jwtService.createJWT(user, '10s');
    const newRefreshToken = jwtService.createJWT(user, '20s');
    await refreshTokensDomain.create({ token: newRefreshToken, wasUsed: false });

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
    res.status(HTTP_STATUSES.OK_200).send({ accessToken: newAccessToken });
});

router.get('/me', authMiddlewareJWT, async (req: Request, res: Response) => {
    if (!req.context?.user) return res.status(401).send();
    res.status(200).send(userMappersQuery.authMe(req.context.user));
});

export default router;