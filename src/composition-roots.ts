import { Container } from 'inversify';
import {UserControllers} from "./controllers/users.controllers";
import {UserDomain} from "./domain/users.domain";
import {UsersCommandRepo, UsersQueryRepo} from "./repositries/users.repositry";
import {QueryRepo} from "./repositries/base.repositry";
import {UserModel} from "./db/collections/users.collection";

const container = new Container();
container.bind(UserControllers).to(UserControllers);
container.bind(UserDomain).to(UserDomain);
container.bind(QueryRepo).to(QueryRepo);

container.bind(UsersQueryRepo).to(UsersQueryRepo);
container.bind(UserModel)
    .toConstantValue(UserModel)
    .whenTargetNamed("master");


container.bind(UserModel)
    .toConstantValue(UserModel)
    .whenTargetNamed("master2");
container.bind(UsersCommandRepo).to(UsersCommandRepo);
export default container;