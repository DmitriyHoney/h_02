import { comparePasswords, isEmail, isLogin } from '../helpers';
import { usersQueryRepo } from '../repositries/users.repositry';
import { AuthBody, Blog, VALIDATION_ERROR_MSG } from '../types/types';

export default {
    login: async (body: AuthBody) => {
        const { loginOrEmail, password } = body;

        const findMethod = isEmail(loginOrEmail)
            ? usersQueryRepo.findUserByEmail.bind(usersQueryRepo)
            : usersQueryRepo.findUserByLogin.bind(usersQueryRepo);

        const isExistUser = await findMethod(loginOrEmail);
        if (!isExistUser) throw new Error(VALIDATION_ERROR_MSG.EMAIL_OR_PASSWORD_NOT_VALID);

        const isPasswordValid = await comparePasswords(password, isExistUser.password);
        return isPasswordValid ? isExistUser : false;
    },
};