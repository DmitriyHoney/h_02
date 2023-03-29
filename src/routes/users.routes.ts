import { Router } from 'express';
import { validatorsErrorsMiddleware } from '../middlewares';
import { createUsersBody as validatorMiddleware } from '../middlewares/users.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { userControllers } from '../controllers/users.controllers';

const router = Router();

router.get('/ttt', authMiddleware, (req, res) => {
    res.status(200).send("wow");
});
router.get('/', authMiddleware, userControllers.getAll.bind(userControllers));
router.post('/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, userControllers.create.bind(userControllers));
router.delete('/:id/', authMiddleware, userControllers.delete.bind(userControllers));

export default router;