import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { StudentsImportConsumer } from './students-import.consumer';
import { KafkaModule } from 'src/kafka/kafka.module';
import { StudentFilterConsumer } from './student-filter.consumer';

@Module({
  imports: [KafkaModule],
  providers: [
    NotificationGateway,
    StudentsImportConsumer,
    StudentFilterConsumer,
  ],
})
export class NotificationModule {}
