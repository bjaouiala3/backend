import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get<string>('MONGO_USERNAME');
        const password = configService.get<string>('MONGO_PASSWORD');
        const host = configService.get<string>('MONGO_HOST');
        const port = configService.get<string>('MONGO_PORT');
        const database = configService.get<string>('MONGO_DATABASE');
        return {
          uri: `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin` || 'mongodb://admin:admin@localhost:27017/tasks?authSource=admin',
        };

      },
      inject: [ConfigService],
    }),
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
