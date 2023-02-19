import { Router, Request, Response } from 'express';
import { createUsersBody as validatorMiddleware } from '../middlewares/users.middleware';
import { authMiddleware, validatorsErrorsMiddleware } from '../middlewares';
import { BaseGetQueryParams, HTTP_STATUSES, VALIDATION_ERROR_MSG, ValidationErrors } from '../types/types';
import { usersQueryRepo } from '../repositries/users.repositry';
import usersDomain from '../domain/users.domain';

const router = Router();

type GetAllUsersQuery = { searchLoginTerm?: string, searchEmailTerm?: string } & BaseGetQueryParams;

router.get('/', authMiddleware, async (req: Request<{}, {}, {}, GetAllUsersQuery>, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection, searchEmailTerm, searchLoginTerm } = req.query;
    const result = await usersQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection, { searchEmailTerm, searchLoginTerm });
    res.send(result);
});

router.post('/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    try {
        const id = await usersDomain.create(req.body);
        const result = await usersQueryRepo.findById(id);
        res.status(HTTP_STATUSES.CREATED_201).send(result);
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

router.delete('/:id/', authMiddleware, async (req: Request, res: Response) => {
    const isDeleted = await usersDomain.deleteOne(req.params.id);
    return isDeleted
        ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
});

export default router;