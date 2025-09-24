import { Router } from 'express';
import { IUserController } from '../controllers/interfaces/user.controller.interface';
import { container } from '../config/inversify.config';

const userRouter = Router();
const controller = container.get<IUserController>('IUserController');


userRouter.get('/search/:search', controller.search.bind(controller));
userRouter.get('/name/:name', controller.getUser.bind(controller));

userRouter.post('/', controller.saveUser.bind(controller));

userRouter.put('/:username', controller.update.bind(controller));

userRouter.delete('/:username', controller.delete.bind(controller));


userRouter.get('/', controller.getAll.bind(controller));

export default userRouter;
