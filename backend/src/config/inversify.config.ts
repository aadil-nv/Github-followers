import 'reflect-metadata';
import { Container } from 'inversify';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { IUserService } from '../services/interfaces/user.service.interface';
import { IUserController } from '../controllers/interfaces/user.controller.interface';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';



const container = new Container();

container.bind<IUserRepository>('IUserRepository').to(UserRepository).inSingletonScope();
container.bind<IUserService>('IUserService').to(UserService).inSingletonScope();
container.bind<IUserController>('IUserController').to(UserController).inSingletonScope();


export { container };
