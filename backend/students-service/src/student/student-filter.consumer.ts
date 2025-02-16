import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';
import { StudentService } from './student.service';
import { StudentGateway } from './student.gateway';
import * as xlsx from 'xlsx';

@Injectable()
export class StudentFilterConsumer implements OnModuleInit {
  private readonly logger = new Logger(StudentFilterConsumer.name);

  constructor(
    private readonly kafkaConsumerService: ConsumerService,
    private readonly studentService: StudentService,
    private readonly studentGateway: StudentGateway,
  ) {}

  async onModuleInit() {
    await this.kafkaConsumerService.consume(
      'student-filter-group', // Consumer group ID
      { topic: 'student-filter', fromBeginning: true }, // Topic to subscribe to
      {
        eachMessage: async ({ message }) => {
          console.log('consuming');
          this.logger.log(`Consuming message: ${message.value?.toString()}`);
          if (message.value) {
            const { minAge, maxAge } = JSON.parse(message.value.toString());
            await this.filterStudents(minAge, maxAge);
          }
        },
      },
    );
  }

  async filterStudents(minAge: number, maxAge: number) {
    // Fetch all students (or paginate if necessary)
    const students = await this.studentService.findAll();

    // Filter students by age
    const filteredStudents = students.filter((student) => {
      const age = this.calculateAge(student.dateOfBirth);
      return age >= minAge && age <= maxAge;
    });

    // Generate and save the file
    const filePath = `./downloads/filtered-students-${Date.now()}.xlsx`;
    this.generateExcelFile(filteredStudents, filePath);

    // Notify the frontend via WebSocket
    this.studentGateway.notifyFileReady(filePath);
  }

  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  generateExcelFile(students: any[], filePath: string) {
    const worksheet = xlsx.utils.json_to_sheet(students);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
    xlsx.writeFile(workbook, filePath);
  }
}
