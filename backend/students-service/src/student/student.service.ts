import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentInput } from './dto/create-student.input';
import { UpdateStudentInput } from './dto/update-student.input';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  create(createStudentInput: CreateStudentInput): Promise<Student> {
    let student = this.studentsRepository.create(createStudentInput);
    return this.studentsRepository.save(student);
  }

  findAll(): Promise<Student[]> {
    return this.studentsRepository.find();
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
}
