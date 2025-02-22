import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';

interface sendEmailInterface {
    hostSendNotification: {
        email: string;
        name: string;
        startingDate: string;
        endingDate: string;

    };
}

@Injectable()
export class MailsService {
    constructor(private readonly mailerService: MailerService) { }

    async sendUserNotificationConfirmationBooking(data: sendEmailInterface['hostSendNotification']) {
        
        await this.mailerService.sendMail({
            to: data.email,
            subject: 'Booking Confirmation',
            template: './confirm',
            context: {
                name: data.name,
                startDate: data.startingDate,
                endDate: data.endingDate,
            },
        }).then(() => {
            console.log('Email sent successfully');
        }).catch((error) => {
        });
    }
}
