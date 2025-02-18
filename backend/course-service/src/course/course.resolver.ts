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
    return await this.courseService.create(createCourseInput);
  }

  @Query(() => [Course], { name: 'getAllCourses' })
  async findAll() {
    return await this.courseService.findAll();
  }

  @Query(() => Course, { name: 'getCourseById' })
  async findOne(@Args('id') id: string) {
    return await this.courseService.findOne(id);
  }

  @Mutation(() => Course)
  async updateCourse(
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
  ) {
    return await this.courseService.update(
      updateCourseInput.id,
      updateCourseInput,
    );
  }

  @Mutation(() => Course)
  async removeCourse(@Args('id') id: string) {
    return await this.courseService.remove(id);
  }

  @ResolveReference()
  async resolveReference(reference: { __typename: string; id: string }) {
    return await this.courseService.findOne(reference.id);
  }
}
