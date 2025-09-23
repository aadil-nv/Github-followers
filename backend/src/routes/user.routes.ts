import { Router } from 'express';
import { IUserController } from '../controllers/interfaces/user.controller.interface';
import { container } from '../config/inversify.config';

const userRouter = Router();
const controller = container.get<IUserController>('IUserController');


userRouter.get('/search', controller.search.bind(controller));
userRouter.get('/:username', controller.save.bind(controller));

userRouter.put('/:username', controller.update.bind(controller));

userRouter.delete('/:username', controller.delete.bind(controller));


userRouter.get('/', controller.getAll.bind(controller));

export default userRouter;
