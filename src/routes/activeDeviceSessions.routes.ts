
import { Router, Request, Response } from 'express';
import { authCheckValidRefreshJWT } from '../middlewares/auth.middleware';
import { deviceActiveSessionsQueryRepo, deviceActiveSessionsCommandRepo } from '../repositries/activeDeviceSessions.repositry';
import { BaseGetQueryParams, HTTP_STATUSES } from '../types/types';

const router = Router();

router.get('/', authCheckValidRefreshJWT, async (req: Request<{}, {}, {}, BaseGetQueryParams>, res: Response) => {
    const { verifiedToken } = req.context;
    const result = await deviceActiveSessionsQueryRepo.findAllByCurrentUser(
        // @ts-ignore
        verifiedToken?.userId,
    );
    res.send(result);
});

router.delete('/:deviceId', authCheckValidRefreshJWT, async (req: Request<{}, {}, {}, BaseGetQueryParams>, res: Response) => {
    // @ts-ignore
    const findRow = await deviceActiveSessionsQueryRepo.findByDeviceId(req.params.deviceId);
    if (!findRow) return res.status(HTTP_STATUSES.NOT_FOUND_404).send();
    if (findRow._userId !== req.context.verifiedToken?.userId) return res.status(HTTP_STATUSES.FORBIDDEN_403).send();

    const result = await deviceActiveSessionsCommandRepo.delete(findRow.id);
    if (!result) return res.status(HTTP_STATUSES.NOT_FOUND_404).send();

    res.status(HTTP_STATUSES.NO_CONTENT_204).send();
});

router.delete('/', authCheckValidRefreshJWT, async (req: Request<{}, {}, {}, BaseGetQueryParams>, res: Response) => {
    // @ts-ignore
    const result = await deviceActiveSessionsCommandRepo.deleteAllByUserId(req.context.verifiedToken?.userId);
    if (!result) return res.status(HTTP_STATUSES.NOT_FOUND_404).send();

    res.status(HTTP_STATUSES.NO_CONTENT_204).send();
});


export default router;