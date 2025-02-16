import { DbModule } from '@/config';
import { ResponseService } from '@/utils';
import { Global, Module } from '@nestjs/common';
import { AuthenticateMiddleware } from '@/middlewares';

@Global()
@Module({
    imports: [DbModule],
    providers: [ResponseService, AuthenticateMiddleware],
    exports: [ResponseService, AuthenticateMiddleware],
})
export class SharedModule { }
