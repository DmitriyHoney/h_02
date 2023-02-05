import { Router, Request, Response } from 'express';
import DB from '../customDB/';
import { Product } from '../types/db.types';

export default {
    getAll: (req: Request, res: Response) => res.send(DB.getRows('products')),
    getOne: (req: Request, res: Response) => {
        try {
            const row = DB.getRow('products', req.params.id);
            res.json(row);
        } catch (e: any) {
            if (e.message === 'Not found') res.status(404).send('Not found');
            res.status(500);
        }
    },
    create: (req: Request, res: Response) => {
        const { title, description }: Product = req.body;
        if (!title || !description) res.status(400).send('Bad request');
        else res.status(201 ).json(DB.createRow('products', { title, description }));
    },
    update: (req: Request, res: Response) => {
        const { title, description }: Product = req.body;
        try {
            const row = DB.updateRow('products', req.params.id, { title, description })
            res.json(row);
        } catch (e: any) {
            if (e.message === 'Not found') res.status(404).send('Not found');
            res.status(500);
        }
    },
    deleteOne: (req: Request, res: Response) => {
        try {
            const el = DB.deleteRow('products', req.params.id)
            res.status(204).json('OK');
        } catch (e: any) {
            if (e.message === 'Not found') res.status(404).send('Not found');
            res.status(500);
        }
    },
    deleteAll: (req: Request, res: Response) => {
        DB.deleteAllRows('products');
        res.status(204).json();
    }
};