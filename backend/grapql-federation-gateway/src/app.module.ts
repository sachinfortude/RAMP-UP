import { Module } from '@nestjs/common';
import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Load the correct .env file
      validate: validateEnv,
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      useFactory: (configService: ConfigService) => ({
        server: {},
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: 'students',
                url: configService.get<string>('STUDENTS_SERVICE_URL'),
              },
              {
                name: 'courses',
                url: configService.get<string>('COURSES_SERVICE_URL'),
              },
            ],
          }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
