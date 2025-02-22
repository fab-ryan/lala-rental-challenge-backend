import { DbModule } from '@/config';
import { ResponseService } from '@/utils';
import { Global, Module } from '@nestjs/common';
import { AuthenticateMiddleware } from '@/middlewares';
import { MailsModule } from '@/modules/mails/mails.module';
import { MailsService } from '@/modules/mails/mails.service';


@Global()
@Module({
    imports: [DbModule,MailsModule],
    providers: [ResponseService, AuthenticateMiddleware, MailsService],
    exports: [ResponseService, AuthenticateMiddleware, MailsService],
})
export class SharedModule { }
