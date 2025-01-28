import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { StudentService } from './student.service';
import { Student } from './entities/student.entity';
import { CreateStudentInput } from './dto/create-student.input';
import { UpdateStudentInput } from './dto/update-student.input';
import { Course } from './entities/course.entity';

@Resolver(() => Student)
export class StudentResolver {
  constructor(private readonly studentService: StudentService) {}

  @Mutation(() => Student)
  createStudent(
    @Args('createStudentInput') createStudentInput: CreateStudentInput,
  ) {
    return this.studentService.create(createStudentInput);
  }

  @Query(() => [Student], { name: 'getAllStudents' })
  findAll() {
    return this.studentService.findAll();
  }

  @Query(() => Student, { name: 'getStudentById' })
  findOne(@Args('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Mutation(() => Student)
  updateStudent(
    @Args('updateStudentInput') updateStudentInput: UpdateStudentInput,
  ) {
    return this.studentService.update(
      updateStudentInput.id,
      updateStudentInput,
    );
  }

  @Mutation(() => Student)
  removeStudent(@Args('id') id: string) {
    return this.studentService.remove(id);
  }

  @ResolveField(() => Course)
  course(@Parent() student: Student): any {
    return { __typename: 'Course', id: student.courseId };
  }
}
