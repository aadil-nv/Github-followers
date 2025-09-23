import 'reflect-metadata';
import { Container } from 'inversify';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { IUserService } from '../services/interfaces/user.service.interface';
import { IUserController } from '../controllers/interfaces/user.controller.interface';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { IAuthController } from '../controllers/interfaces/auth.controller.interface';
import { IAuthService } from '../services/interfaces/auth.service.interface';


const container = new Container();

container.bind<IUserRepository>('IUserRepository').to(UserRepository).inSingletonScope();
container.bind<IUserService>('IUserService').to(UserService).inSingletonScope();
container.bind<IUserController>('IUserController').to(UserController).inSingletonScope();

container.bind<IAuthController>('IAuthController').to(AuthController).inSingletonScope();
container.bind<IAuthService>('IAuthService').to(AuthService).inSingletonScope();

export { container };
