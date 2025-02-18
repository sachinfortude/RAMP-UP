import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { Course } from './entities/course.entity';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createCourseInput: CreateCourseInput): Promise<Course> {
    try {
      let course = this.courseRepository.create(createCourseInput);
      return await this.courseRepository.save(course);
    } catch (error) {
      this.logger.error(`Error creating a course: ${error.message}`);
      throw new InternalServerErrorException('Error while creating course');
    }
  }

  async findAll(): Promise<Course[]> {
    try {
      return await this.courseRepository.find();
    } catch (error) {
      this.logger.error(`Error while fetching courses: ${error.message}`);
      throw new InternalServerErrorException('Error while fetching courses');
    }
  }

  async findOne(id: string): Promise<Course> {
    try {
      const course = await this.courseRepository.findOne({ where: { id } });

      if (!course) {
        throw new NotFoundException(`Record not found with id ${id}`);
      }

      return course;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error while fetching the course');
    }
  }

  async update(
    id: string,
    updateCourseInput: UpdateCourseInput,
  ): Promise<Course> {
    try {
      const course = await this.courseRepository.preload({
        ...updateCourseInput,
      });

      if (!course) {
        throw new NotFoundException(`Record not found with id ${id}`);
      }

      return await this.courseRepository.save(course);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error while updating the course');
    }
  }

  async remove(id: string): Promise<Course> {
    try {
      let course = await this.courseRepository.findOne({ where: { id } });

      if (!course) {
        throw new NotFoundException(`Record not found with id ${id}`);
      }

      this.courseRepository.remove(course);
      return course;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error while deleting the course');
    }
  }
}
