import { Router, Request, Response } from 'express';
import blogsDomain from '../domain/blogs.domain';
const router = Router();
import { createBlogsBody as validatorMiddleware } from '../middlewares/blogs.middleware';
import { authMiddleware, validatorsErrorsMiddleware } from '../middlewares';
import { HTTP_STATUSES } from '../types/types';

router.get('/', async (req: Request, res: Response) => {
    const result = await blogsDomain.getAll();
    res.send(result);
});

router.get('/:id/', async (req: Request, res: Response) => {
    const result = await blogsDomain.getOne(req.params.id);
    if (!result) {
        res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    res.status(HTTP_STATUSES.OK_200).send(result);
});

router.post('/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const result = await blogsDomain.create(req.body);
    res.status(HTTP_STATUSES.CREATED_201).send(result);
});

router.put('/:id/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const isUpdated = await blogsDomain.update(req.params.id, req.body);
    return isUpdated
        ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
});

router.delete('/:id/', authMiddleware, async (req: Request, res: Response) => {
    const isDeleted = await blogsDomain.deleteOne(req.params.id);
    return isDeleted
        ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
});

export default router;