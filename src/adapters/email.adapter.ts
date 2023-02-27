import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test.dmitry.bolshakov@gmail.com',
      pass: 'lbqzlywnfkqjsyih', 
    },
});

export const emailAdapter = {
    async sendMail(to: string, subject: string, text: string, html: string) {
        return await transporter.sendMail({
            from: '"Backend application" <test.dmitry.bolshakov@gmail.com>',
            to,
            subject,
            text,
            html,
        });
    }
};
