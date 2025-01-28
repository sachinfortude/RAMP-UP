import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentResolver } from './student.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { CourseResolver } from './course.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  providers: [StudentResolver, StudentService, CourseResolver],
})
export class StudentModule {}
