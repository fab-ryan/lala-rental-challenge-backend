import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PropertyModule } from './modules/property/property.module';
import { BookingModule } from './modules/booking/booking.module';
import { StatsModule } from './modules/stats/stats.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailsModule } from './modules/mails/mails.module';

@Module({
  imports: [SharedModule, UsersModule, AuthModule, PropertyModule, BookingModule, StatsModule, MailsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        cacheControl: true,
        maxAge: 60 * 60 * 24 * 30,
        redirect: true,
      },
    }),
    

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
