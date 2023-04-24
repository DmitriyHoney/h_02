"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const users_controllers_1 = require("./controllers/users.controllers");
const users_domain_1 = require("./domain/users.domain");
const users_repositry_1 = require("./repositries/users.repositry");
const base_repositry_1 = require("./repositries/base.repositry");
const users_collection_1 = require("./db/collections/users.collection");
const container = new inversify_1.Container();
container.bind(users_controllers_1.UserControllers).to(users_controllers_1.UserControllers);
container.bind(users_domain_1.UserDomain).to(users_domain_1.UserDomain);
container.bind(base_repositry_1.QueryRepo).to(base_repositry_1.QueryRepo);
container.bind(users_repositry_1.UsersQueryRepo).to(users_repositry_1.UsersQueryRepo);
container.bind(users_collection_1.UserModel)
    .toConstantValue(users_collection_1.UserModel)
    .whenTargetNamed("master");
container.bind(users_collection_1.UserModel)
    .toConstantValue(users_collection_1.UserModel)
    .whenTargetNamed("master2");
container.bind(users_repositry_1.UsersCommandRepo).to(users_repositry_1.UsersCommandRepo);
exports.default = container;
