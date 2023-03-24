import { userDomain, UserDomain } from "../domain/users.domain";
import { Router, Request, Response } from 'express';
import { BaseGetQueryParams, HTTP_STATUSES, VALIDATION_ERROR_MSG, ValidationErrors } from '../types/types';

type GetAllUsersQuery = { searchLoginTerm?: string, searchEmailTerm?: string } & BaseGetQueryParams;

class UserControllers {
    constructor(
        protected usersDomain: UserDomain
    ) {
        this.usersDomain = usersDomain;
    }
    async getAll(req: Request<{}, {}, {}, GetAllUsersQuery>, res: Response) {
        const { pageSize, pageNumber, sortBy, sortDirection, searchEmailTerm, searchLoginTerm } = req.query;
        const result = await this.usersDomain.usersQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection, { searchEmailTerm, searchLoginTerm });
        res.send(result);
    }
    
    async create(req: Request, res: Response) {
        try {
            const id = await this.usersDomain.create(req.body);
            // @ts-ignore
            const result = await this.usersDomain.usersQueryRepo.findById(id);
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
    };
    
    async delete(req: Request, res: Response) {
        const isDeleted = await this.usersDomain.deleteOne(req.params.id);
        return isDeleted
            ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
    };
}

export const userControllers = new UserControllers(userDomain);