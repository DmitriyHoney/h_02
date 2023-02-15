import { Router, Request, Response } from 'express';
import { createBlogsBody as validatorMiddleware } from '../middlewares/blogs.middleware';
import { authMiddleware, validatorsErrorsMiddleware } from '../middlewares';
import { HTTP_STATUSES } from '../types/types';
import { blogsQueryRepo } from '../repositries/blogs.repositry';
import blogsDomain from '../domain/blogs.domain';

const router = Router();

router.get('/', async (req: Request<{}, {}, {}, { searchNameTerm: string | null }>, res: Response) => {
    const result = await blogsQueryRepo.find(req.query.searchNameTerm);
    res.send(result);
});

router.get('/:id/', async (req: Request, res: Response) => {
    const result = await blogsQueryRepo.findById(req.params.id);
    if (!result) {
        res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    res.status(HTTP_STATUSES.OK_200).send(result);
});

router.post('/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const id = await blogsDomain.create(req.body);
    const result = await blogsQueryRepo.findById(id);
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