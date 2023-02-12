import { Request, Response } from 'express';
import { HTTP_STATUSES } from '../types/types';
import postsRepo from '../repositries/posts.repositry';

export default {
    getAll: async (req: Request, res: Response) => {
        const result = await postsRepo.find();
        res.send(result);
    },
    getOne: async (req: Request, res: Response) => {
        const item = await postsRepo.findById(req.params.id);
        if (!item) {
            res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
            return;
        }
        res.status(HTTP_STATUSES.OK_200).send(item);
    },
    create: async (req: Request, res: Response) => {
        const item = await postsRepo.create(req.body);
        res.status(HTTP_STATUSES.CREATED_201).send(item);
    },
    update: async (req: Request, res: Response) => {
        const isUpdated = await postsRepo.update(req.params.id, req.body);
        return isUpdated
            ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
    },
    deleteOne: async (req: Request, res: Response) => {
        const isDeleted = await postsRepo.delete(req.params.id);
        return isDeleted
            ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
            : res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        
    },
    deleteAll: (req: Request, res: Response) => postsRepo._deleteAll(),
};