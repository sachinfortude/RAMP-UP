import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Course } from './entities/course.entity';
import { StudentService } from './student.service';
import { Student } from './entities/student.entity';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly studentsService: StudentService) {}

  @ResolveField(() => [Student])
  public students(@Parent() course: Course): Promise<Student[]> {
    return this.studentsService.forCourse(course.id);
  }
}
