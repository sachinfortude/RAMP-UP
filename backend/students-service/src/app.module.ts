import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { StudentModule } from './student/student.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './student/entities/course.entity';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './config/env.validation'; // Import the Zod validation function

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Load the correct .env file
      validate: validateEnv, // schema based validation for enviornment variables
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { path: 'schema.gql', federation: 2 },
      buildSchemaOptions: {
        orphanedTypes: [Course],
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('SYNC_DATABASE'),
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: process.env.BULL_BOARD_ROUTE || '/admin/queues', // The route where Bull Board UI will be available
      adapter: ExpressAdapter,
    }),
    StudentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
