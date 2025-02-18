import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveReference,
} from '@nestjs/graphql';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Mutation(() => Course)
  async createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
  ) {
    try {
      return await this.courseService.create(createCourseInput);
    } catch (error) {
      throw error;
    }
  }

  @Query(() => [Course], { name: 'getAllCourses' })
  async findAll() {
    try {
      return await this.courseService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Query(() => Course, { name: 'getCourseById' })
  async findOne(@Args('id') id: string) {
    try {
      return await this.courseService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => Course)
  async updateCourse(
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
  ) {
    try {
      return await this.courseService.update(
        updateCourseInput.id,
        updateCourseInput,
      );
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => Course)
  async removeCourse(@Args('id') id: string) {
    try {
      return await this.courseService.remove(id);
    } catch (error) {
      throw error;
    }
  }

  @ResolveReference()
  async resolveReference(reference: { __typename: string; id: string }) {
    return await this.courseService.findOne(reference.id);
  }
}
