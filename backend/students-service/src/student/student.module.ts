import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentResolver } from './student.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { CourseResolver } from './course.resolver';
import { StudentController } from './student.controller';
import { BullModule } from '@nestjs/bullmq';
import { StudentImportProcessor } from './student-import.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    BullModule.registerQueue({ name: 'student-import' }),
  ],
  providers: [
    StudentResolver,
    StudentService,
    CourseResolver,
    StudentImportProcessor,
  ],
  controllers: [StudentController],
})
export class StudentModule {}
