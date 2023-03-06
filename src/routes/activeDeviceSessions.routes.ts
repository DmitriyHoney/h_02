
import { Router, Request, Response } from 'express';
import { authCheckValidRefreshJWT } from '../middlewares/auth.middleware';
import { deviceActiveSessionsQueryRepo } from '../repositries/activeDeviceSessions.repositry';
import { BaseGetQueryParams } from '../types/types';

const router = Router();

router.get('/', authCheckValidRefreshJWT, async (req: Request<{}, {}, {}, BaseGetQueryParams>, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    const { verifiedToken } = req.context;
    const result = await deviceActiveSessionsQueryRepo.findAllByCurrentUser(
        // @ts-ignore
        verifiedToken?.userId, 
        pageSize, 
        pageNumber, 
        sortBy, 
        sortDirection
    );
    res.send(result);
});

router.delete('/:deviceId', authCheckValidRefreshJWT, async (req: Request<{}, {}, {}, BaseGetQueryParams>, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    const result = await deviceActiveSessionsQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection);
    res.send(result);
});


export default router;