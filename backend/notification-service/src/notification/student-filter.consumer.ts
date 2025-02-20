import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { ConsumerService } from '../kafka/consumer/consumer.service';

@Injectable()
export class StudentFilterConsumer implements OnModuleInit {
  private readonly logger = new Logger(StudentFilterConsumer.name);

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async onModuleInit() {
    await this.consumerService.consume(
      'student-filter-group', // Consumer group ID
      { topic: 'student-filter' }, // New Kafka topic for student filter events
      {
        eachMessage: async ({ topic, partition, message }) => {
          if (message.value) {
            const { filePath } = JSON.parse(message.value.toString());
            this.logger.log(
              `Received message from topic: ${topic} with filePath: ${filePath}`,
            );
            this.notificationGateway.notifyFileReady(filePath);
          }
        },
      },
    );
  }
}
