import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [KafkaModule, NotificationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
