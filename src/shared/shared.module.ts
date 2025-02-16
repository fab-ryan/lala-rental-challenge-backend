import { DbModule } from '@/config';
import { ResponseService } from '@/utils';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
    imports: [DbModule],
    providers: [ResponseService],
    exports: [ResponseService],
})
export class SharedModule {}
