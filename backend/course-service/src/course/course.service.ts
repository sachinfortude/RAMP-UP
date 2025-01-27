import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { Course } from './entities/course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  create(createCourseInput: CreateCourseInput): Promise<Course> {
    let course = this.courseRepository.create(createCourseInput);
    return this.courseRepository.save(course);
  }

  findAll(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new NotFoundException(`Record cannot find by id ${id}`);
    }

    return course;
  }

  async update(
    id: string,
    updateCourseInput: UpdateCourseInput,
  ): Promise<Course> {
    let course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new NotFoundException(`Record cannot find by id ${id}`);
    }

    course.name = updateCourseInput.name;
    course.description = updateCourseInput.description;
    course.credits = updateCourseInput.credits;

    return this.courseRepository.save(course);
  }

  async remove(id: string): Promise<Course> {
    let course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new NotFoundException(`Record cannot find by id ${id}`);
    }

    this.courseRepository.remove(course);
    return course;
  }
}
