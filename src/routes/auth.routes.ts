import { Router, Request, Response } from 'express';
import { authBody as validatorMiddleware } from '../middlewares/auth.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import { HTTP_STATUSES, VALIDATION_ERROR_MSG, ValidationErrors } from '../types/types';
import authDomain from '../domain/auth.domain';

const router = Router();

router.post('/login', ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    try {
        const isSuccessLogin = await authDomain.login(req.body);
        isSuccessLogin 
            ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();
    } catch(e) {
        const errMsg = (e as Error).message;
        if ((e as Error).message === VALIDATION_ERROR_MSG.EMAIL_OR_PASSWORD_NOT_VALID) {
            const resultErrors: ValidationErrors = {
                errorsMessages: [
                    { field: 'loginOrEmail', message: errMsg }
                ]
            }
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send(resultErrors);
        } else {
            res.status(HTTP_STATUSES.NOT_AUTHORIZED_401).send();
        }
    }
});

export default router;