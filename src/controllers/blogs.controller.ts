import { Request, Response } from 'express';
import { HTTP_STATUSES } from '../types/types';
import productRepo from '../repositries/blogs.repositry';

export default {
    getAll: async (req: Request, res: Response) => {
        const result = await productRepo.find()
        res.send(result);
    },
    getOne: async (req: Request, res: Response) => {
        const item = await productRepo.findById(+req.params.id);
        if (!item) {
            res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
            return;
        }
        res.status(HTTP_STATUSES.OK_200).send(item);
    },
    create: async (req: Request, res: Response) => {
        const item = await productRepo.create(req.body);
        res.status(HTTP_STATUSES.CREATED_201).send(item);
    },
    update: async (req: Request, res: Response) => {
        const isUpdated = await productRepo.update(+req.params.id, req.body);
        return isUpdated
            ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
    },
    deleteOne: async (req: Request, res: Response) => {
        const isDeleted = await productRepo.delete(+req.params.id);
        return isDeleted
            ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
    },
    deleteAll: (req: Request, res: Response) => productRepo._deleteAll()
};