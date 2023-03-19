import { emailAdapter } from "../adapters/email.adapter";

export const emailManager = {
    async sendRegCodeConfirm(email: string, code: string) {
        await emailAdapter.sendMail(
            email, 
            'Подтверждение регистрации',
            'Подтвердите адрес электронной почты, если это не вы просто проигнорируйте данное сообщение',
            `<h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
            </p>`
        )
    },
    async sendRecoverPassCodeConfirm(email: string, code: string) {
        await emailAdapter.sendMail(
            email, 
            'Восстановление пароля',
            'Восстановление пароля, если это не вы просто проигнорируйте данное сообщение',
            `<h1>Password recovery</h1>
             <p>To finish password recovery please follow the link below:
               <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
             </p>`
        )
    }
};