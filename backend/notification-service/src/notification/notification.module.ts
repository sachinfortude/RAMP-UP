import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { StudentsImportConsumer } from './students-import.consumer';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  providers: [NotificationGateway, StudentsImportConsumer],
})
export class NotificationModule {}
