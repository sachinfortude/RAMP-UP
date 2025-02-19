import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';

@Injectable()
export class StudentsImportConsumer implements OnModuleInit {
  private readonly logger = new Logger(StudentsImportConsumer.name);

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async onModuleInit() {
    await this.consumerService.consume(
      'student-import-group',
      { topic: 'student-import' },
      {
        eachMessage: async ({ topic, partition, message }) => {
          if (message.value) {
            const { status, message: msg } = JSON.parse(
              message.value.toString(),
            );
            this.logger.log(`Received message: ${msg} with status: ${status}`);

            if (status === 'completed') {
              this.notificationGateway.notifyJobCompleted(msg);
            } else if (status === 'failed') {
              this.notificationGateway.notifyJobFailed(msg);
            }
          }
        },
      },
    );
  }
}
