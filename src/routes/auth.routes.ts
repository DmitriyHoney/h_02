import { Router, Request, Response } from 'express';
import { authMiddlewareJWT, authBody as validatorMiddleware, authRegistration, authRegistrationConfirm, authRegistrationResend } from '../middlewares/auth.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import { HTTP_STATUSES, ValidationErrors, VALIDATION_ERROR_MSG } from '../types/types';
import authDomain from '../domain/auth.domain';
import { jwtService } from '../helpers/jwt-service';
import { userMappersQuery, usersQueryRepo } from '../repositries/users.repositry';
import { emailManager } from '../managers/email.manager';
import { generateUUID } from '../helpers';
import usersDomain from '../domain/users.domain';

const router = Router();

router.post('/registration', ...authRegistration, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const expiredDate = new Date();
    expiredDate.setHours(expiredDate.getHours() + 1);
    try {
        const confirmedCode = generateUUID();
        await usersDomain.create({
            ...req.body,
            confirmedInfo: {
                code: confirmedCode,
                codeExpired: expiredDate.toISOString(),
                isConfirmedEmail: false,
            }
        });

        const info = await emailManager.sendRegCodeConfirm(req.body.email, confirmedCode);
        res.status(204).send();
    } catch (e) {
        const userExistErrors = [VALIDATION_ERROR_MSG.USER_THIS_EMAIL_EXIST, VALIDATION_ERROR_MSG.USER_THIS_LOGIN_EXIST];
        const errMsg = (e as Error).message;
        if (userExistErrors.includes(errMsg)) {
            const errorField = errMsg.indexOf('login') >= 0 ? 'login' : 'email';
            const resultErrors: ValidationErrors = {
                errorsMessages: [
                    { field: errorField, message: errMsg }
                ]
            }
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send(resultErrors);
        } else {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errMsg);
        }
    }
});

router.post('/registration-confirmation', ...authRegistrationConfirm, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const user = await usersQueryRepo.findNoActUserByConfirmedCode(req.body.code);
    if (!user) return res.status(400).send();
    const isCodeValid = authDomain.isCodeConfirmationValid(req.body.code, user);
    const errorsCodeAlreadyActivated: ValidationErrors = {
        errorsMessages: [{ message: 'Code already activated', field: 'code' }],
    };
    if (user.confirmedInfo?.isConfirmedEmail) return res.status(400).send(errorsCodeAlreadyActivated);
    
    const errorsCodeNotValid: ValidationErrors = {
        errorsMessages: [{ message: 'Code not valid', field: 'code' }],
    };
    if (!isCodeValid) return res.status(400).send(errorsCodeNotValid);
    const isWasUpdated = await usersDomain.update(user.id, { 
        ...user, 
        confirmedInfo: { 
            code: '',
            codeExpired: '',
            isConfirmedEmail: true,
        }
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
        const accessToken = jwtService.createJWT(isUserSuccessAuth);
        res.status(HTTP_STATUSES.OK_200).send({ accessToken });
    } catch(e) {
        if ((e as Error).message === VALIDATION_ERROR_MSG.EMAIL_OR_PASSWORD_NOT_VALID) {
            res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();
        } else res.status(HTTP_STATUSES.BAD_REQUEST_400).send();
    }
});

router.get('/me', authMiddlewareJWT, async (req: Request, res: Response) => {
    if (!req.context?.user) return res.status(401).send();
    res.status(200).send(userMappersQuery.authMe(req.context.user));
});

export default router;