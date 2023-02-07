import { Request, Response } from 'express';
import { HTTP_STATUSES } from '..';
import postsRepo from '../repositries/posts.repositry';

export default {
    getAll: (req: Request, res: Response) => res.send(postsRepo.find()),
    getOne: (req: Request, res: Response) => {
        const item = postsRepo.findById(+req.params.id);
        if (!item) {
            res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
            return;
        }
        res.status(HTTP_STATUSES.OK_200).send(item);
    },
    create: (req: Request, res: Response) => {
        const body = req.body;
        const item = postsRepo.create(body);
        res.status(HTTP_STATUSES.CREATED_201).send(item);
    },
    update: (req: Request, res: Response) => {
        const body = req.body;
        const isUpdated = postsRepo.update(+req.params.id, body);
        if (!isUpdated) {
            res.status(HTTP_STATUSES.NOT_FOUND_404).send();
            return;
        };
        res.status(HTTP_STATUSES.NO_CONTENT_204).send();
    },
    deleteOne: (req: Request, res: Response) => {
        const isDeleted = postsRepo.delete(+req.params.id);
        if (!isDeleted) {
            res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
            return;
        }
        res.status(HTTP_STATUSES.NO_CONTENT_204).send();
    },
    deleteAll: (req: Request, res: Response) => {
        const isDeleted = postsRepo._deleteAll();
        if (!isDeleted) {
            res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
            return;
        }
        res.status(HTTP_STATUSES.NO_CONTENT_204).send();
    }
};