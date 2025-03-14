import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentResolver } from './student.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { CourseResolver } from './course.resolver';
import { StudentController } from './student.controller';
import { BullModule } from '@nestjs/bullmq';
import { StudentImportProcessor } from './student-import.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { KafkaModule } from 'src/kafka/kafka.module';
import { StudentFilterProcessor } from './student-filter.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    BullModule.registerQueue({ name: 'student-import' }),
    BullModule.registerQueue({ name: 'student-filter' }),
    BullBoardModule.forFeature({
      name: 'student-import',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'student-filter',
      adapter: BullMQAdapter,
    }),
    KafkaModule,
  ],
  providers: [
    StudentResolver,
    StudentService,
    CourseResolver,
    StudentImportProcessor,
    StudentFilterProcessor,
  ],
  controllers: [StudentController],
})
export class StudentModule {}
