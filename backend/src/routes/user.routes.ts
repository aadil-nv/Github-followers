import { Router } from 'express';
import { IUserController } from '../controllers/interfaces/user.controller.interface';
import { container } from '../config/inversify.config';

const userRouter = Router();
const controller = container.get<IUserController>('IUserController');

userRouter.post('/', controller.create.bind(controller));
userRouter.put('/:id', controller.update.bind(controller));
userRouter.delete('/:id', controller.delete.bind(controller));
userRouter.get('/:id', controller.getById.bind(controller));
userRouter.get('/', controller.getAll.bind(controller));
userRouter.post('/login', controller.login.bind(controller));

export default userRouter;
