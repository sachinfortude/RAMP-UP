import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer/consumer.service';

@Module({
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class KafkaModule {}
