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

@Resolver(() => Student)
export class StudentResolver {
  constructor(private readonly studentService: StudentService) {}

  @Mutation(() => Student)
  async createStudent(
    @Args('createStudentInput') createStudentInput: CreateStudentInput,
  ) {
    try {
      return await this.studentService.create(createStudentInput);
    } catch (error) {
      throw error;
    }
  }

  @Query(() => PaginatedStudents, { name: 'getAllStudents' })
  async findAll(@Args('paginationInput') paginationInput: PaginationInput) {
    try {
      return await this.studentService.fetchPaginatedStudents(paginationInput);
    } catch (error) {
      throw error;
    }
  }

  @Query(() => Student, { name: 'getStudentById' })
  async findOne(@Args('id') id: string) {
    try {
      return await this.studentService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => Student)
  async updateStudent(
    @Args('updateStudentInput') updateStudentInput: UpdateStudentInput,
  ) {
    try {
      return await this.studentService.update(
        updateStudentInput.id,
        updateStudentInput,
      );
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => Student)
  async removeStudent(@Args('id') id: string) {
    try {
      return await this.studentService.remove(id);
    } catch (error) {
      throw error;
    }
  }

  @ResolveField(() => Course)
  course(@Parent() student: Student): any {
    return { __typename: 'Course', id: student.courseId };
  }
}
