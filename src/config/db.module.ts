import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from './conf'
import { Logger } from '@/utils'


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: ['.env']
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE'),
      }),
      inject: [ConfigService]

    })
  ]
})
export class DbModule {
  constructor(private readonly configService: ConfigService) {
    Logger.logger.log(this.configService.get('DB_HOST'))
    this.connectDatabase();
  }

  private async connectDatabase() {
    const databaseName = this.configService.get('DB_DATABASE');
    const connection = TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE'),
      }),
      inject: [ConfigService],
    });

    try {
      await connection;
      Logger.logger.log(`Database is connected successfully 🌏🔥`);
    } catch (error) {
      const message = (error as Error).message;
      Logger.logger.error(`Failed to connect to ${databaseName} database`, {
        error: message,
      });
    }
  }
}