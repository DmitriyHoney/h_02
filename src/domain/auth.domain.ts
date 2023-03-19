import { comparePasswords, isEmail } from '../helpers';
import { usersQueryRepo } from '../repositries/users.repositry';
import { AuthBody, User, VALIDATION_ERROR_MSG } from '../types/types';

export default {
    _login: async (body: AuthBody) => {
        const { loginOrEmail, password } = body;

        const findMethod = isEmail(loginOrEmail)
            ? usersQueryRepo.findUserByEmail.bind(usersQueryRepo)
            : usersQueryRepo.findUserByLogin.bind(usersQueryRepo);

        const user = await findMethod(loginOrEmail);
        if (!user)
            throw new Error(VALIDATION_ERROR_MSG.EMAIL_OR_PASSWORD_NOT_VALID);
        // @ts-ignore
        const isPasswordValid = await comparePasswords(password, user.password);
        return isPasswordValid ? user : null;
    },
    get login() {
        return this._login;
    },
    set login(value) {
        this._login = value;
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