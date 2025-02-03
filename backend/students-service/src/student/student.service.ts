import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentInput } from './dto/create-student.input';
import { UpdateStudentInput } from './dto/update-student.input';
import { Student } from './entities/student.entity';
import { PaginationInput } from './dto/pagination.input';
import { PaginatedStudents } from './dto/paginated.output';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectQueue('student-import')
    private readonly studentImportQueue: Queue,
  ) {}

  async createStudentImportJob(file: Express.Multer.File) {
    const job = await this.studentImportQueue.add('importStudents', {
      file: file,
    });
    return job;
  }

  async create(createStudentInput: CreateStudentInput): Promise<Student> {
    let student = this.studentsRepository.create(createStudentInput);
    return await this.studentsRepository.save(student);
  }

  async findAll(paginationInput: PaginationInput): Promise<PaginatedStudents> {
    const { page, limit } = paginationInput;
    const skip = (page - 1) * limit;

    const [students, totalRecords] = await this.studentsRepository.findAndCount(
      {
        skip,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      },
    );

    return {
      students,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }

  async findOne(id: string): Promise<Student | null> {
    const student = await this.studentsRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException(`Record cannot find by id ${id}`);
    }

    return student;
  }

  async update(
    id: string,
    updateStudentInput: UpdateStudentInput,
  ): Promise<Student> {
    let student = await this.studentsRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException(`Record cannot find by id ${id}`);
    }

    student.firstName = updateStudentInput.firstName;
    student.lastName = updateStudentInput.lastName;
    student.dateOfBirth = updateStudentInput.dateOfBirth;
    student.email = updateStudentInput.email;
    student.courseId = updateStudentInput.courseId;

    return this.studentsRepository.save(student);
  }

  async remove(id: string): Promise<Student> {
    let student = await this.studentsRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException(`Record cannot find by id ${id}`);
    }

    this.studentsRepository.remove(student);
    return student;
  }

  async forCourse(courseId: string): Promise<Student[]> {
    return await this.studentsRepository.find({
      where: {
        courseId,
      },
    });
  }
}
