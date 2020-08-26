import { Injectable } from '@nestjs/common';
import { EmailPayload } from './interfaces/email-payload';

@Injectable()
export class EmailService {
    send(email: EmailPayload) {
        console.log(`Sending email to ${email.to} with content '${email.html}'`);
    }
}
