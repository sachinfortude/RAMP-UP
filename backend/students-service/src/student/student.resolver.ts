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
import { PaginationInput } from './dto/pagination.input';
import { PaginatedStudents } from './dto/paginated.output';
import { FilterStudentsInput } from './dto/filter-students.input';

@Resolver(() => Student)
export class StudentResolver {
  constructor(private readonly studentService: StudentService) {}

  @Mutation(() => Student)
  async createStudent(
    @Args('createStudentInput') createStudentInput: CreateStudentInput,
  ) {
    return await this.studentService.create(createStudentInput);
  }

  @Query(() => PaginatedStudents, { name: 'getAllStudents' })
  async findAll(@Args('paginationInput') paginationInput: PaginationInput) {
    return await this.studentService.fetchPaginatedStudents(paginationInput);
  }

  @Query(() => Student, { name: 'getStudentById' })
  async findOne(@Args('id') id: string) {
    return await this.studentService.findOne(id);
  }

  @Query(() => String, { name: 'filterStudents' })
  async filterStudents(
    @Args('filterStudentsInput') filterStudentsInput: FilterStudentsInput,
  ) {
    const { minAge, maxAge } = filterStudentsInput;
    const job = await this.studentService.createStudentFilterJob(
      minAge,
      maxAge,
    );
    return job.id;
  }

  @Mutation(() => Student)
  async updateStudent(
    @Args('updateStudentInput') updateStudentInput: UpdateStudentInput,
  ) {
    return await this.studentService.update(
      updateStudentInput.id,
      updateStudentInput,
    );
  }

  @Mutation(() => Student)
  async removeStudent(@Args('id') id: string) {
    return await this.studentService.remove(id);
  }

  @ResolveField(() => Course)
  course(@Parent() student: Student): any {
    return { __typename: 'Course', id: student.courseId };
  }
}
