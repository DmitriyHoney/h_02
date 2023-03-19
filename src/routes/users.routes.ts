import { Router, Request, Response } from 'express';
import { validatorsErrorsMiddleware } from '../middlewares';
import { BaseGetQueryParams, HTTP_STATUSES, VALIDATION_ERROR_MSG, ValidationErrors } from '../types/types';
import { usersQueryRepo } from '../repositries/users.repositry';
import usersDomain from '../domain/users.domain';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

type GetAllUsersQuery = { searchLoginTerm?: string, searchEmailTerm?: string } & BaseGetQueryParams;

router.get('/', authMiddleware, async (req: Request<{}, {}, {}, GetAllUsersQuery>, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection, searchEmailTerm, searchLoginTerm } = req.query;
    const result = await usersQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection, { searchEmailTerm, searchLoginTerm });
    res.send(result);
});

router.post('/', authMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    try {
        const id = await usersDomain.create(req.body);
        // @ts-ignore
        const result = await usersQueryRepo.findById(id);
        res.status(HTTP_STATUSES.CREATED_201).send(result);
    } catch (e) {
        const errorMsg = (e as Error).message;
        if ([VALIDATION_ERROR_MSG.USER_THIS_EMAIL_EXIST, VALIDATION_ERROR_MSG.USER_THIS_LOGIN_EXIST].includes(errorMsg)) {
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
                errorsMessages: [
                    {
                        field: errorMsg.indexOf('email') >= 0 ? 'email' : 'login',
                        message: errorMsg
                    }
                ]
            });
        }
        try {
            const errorsMessages = errorMsg.split(',').map((errTxt) => {
                const lst = errTxt.split(':');
                return lst.length > 2 ? { field: lst[1].trim(), message: lst[2].trim() } : { field: lst[0].trim(), message: lst[1].trim() }
            });
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send({ errorsMessages })
        } catch {
            res.status(HTTP_STATUSES.SERVER_ERROR_500).send(errorMsg)
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