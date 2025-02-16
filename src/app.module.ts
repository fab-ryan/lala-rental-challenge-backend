import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PropertyModule } from './modules/property/property.module';


@Module({
  imports: [SharedModule, UsersModule, AuthModule, PropertyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
