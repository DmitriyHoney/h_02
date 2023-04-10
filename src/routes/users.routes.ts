import { Router } from 'express';
import { validatorsErrorsMiddleware } from '../middlewares';
import { createUsersBody as validatorMiddleware } from '../middlewares/users.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserControllers } from '../controllers/users.controllers';
import container from '../composition-roots';
const userControllers = container.resolve(UserControllers);

const router = Router();

router.get('/ttt', (req, res) => {
    res.status(200).send("wow");
});
router.get('/', authMiddleware, userControllers.getAll.bind(userControllers));
router.post('/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, userControllers.create.bind(userControllers));
router.delete('/:id/', authMiddleware, userControllers.delete.bind(userControllers));

export default router;