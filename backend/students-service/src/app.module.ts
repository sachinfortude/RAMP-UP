import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloDriver,
  ApolloDriverConfig,
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { StudentModule } from './student/student.module';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './student/entities/course.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { path: 'schema.gql', federation: 2 },
      buildSchemaOptions: {
        orphanedTypes: [Course],
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'postgrespw',
      database: 'studentsDb',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    StudentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
