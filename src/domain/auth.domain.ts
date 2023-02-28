import { comparePasswords, isEmail, isLogin } from '../helpers';
import { usersQueryRepo } from '../repositries/users.repositry';
import { AuthBody, Blog, User, VALIDATION_ERROR_MSG } from '../types/types';

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
    isCodeConfirmationValid: (code: string, user: User) => {
        // @ts-ignore
        const expiredDate = new Date(user.confirmedInfo?.codeExpired);
        const curDate = new Date();

        const isCodesEqual = code === user.confirmedInfo?.code;
        const isDateNotExpired = curDate <= expiredDate;
        return isCodesEqual || isDateNotExpired;
    }
};