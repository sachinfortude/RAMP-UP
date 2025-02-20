import { Processor, WorkerHost } from '@nestjs/bullmq';
import { StudentService } from './student.service';
import { Job } from 'bullmq';
import * as xlsx from 'xlsx';
import { Logger } from '@nestjs/common';

/* 
    Generating an Excel file for student filtering can be a resource-intensive operation, especially if there are thousands or millions of students in the database.
    Instead of blocking the HTTP request and making the user wait, Bull queues the job to be processed in the background.
*/
@Processor('student-filter')
export class StudentFilterProcessor extends WorkerHost {
  private readonly logger = new Logger(StudentFilterProcessor.name);

  constructor(private readonly studentsService: StudentService) {
    super();
  }

  async process(job: Job, token?: string): Promise<any> {
    const { minAge, maxAge } = job.data;
    this.logger.log(
      `Filtering students with age between ${minAge} and ${maxAge}`,
    );

    const students = await this.filterStudents(minAge, maxAge);
    const filePath = this.generateExcelFile(students);

    this.logger.log(`Filtered students saved to ${filePath}`);
    await this.notifyFileReady(filePath);
  }

  private async filterStudents(minAge: number, maxAge: number) {
    return this.studentsService.filterStudentsByAge(minAge, maxAge);
  }

  private generateExcelFile(students: any[]): string {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(students);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

    const fileName = `filtered-students-${Date.now()}.xlsx`;
    const filePath = `./downloads/${fileName}`;
    xlsx.writeFile(workbook, filePath);
    return filePath;
  }

  private async notifyFileReady(filePath: string) {
    await this.studentsService.notifyFileReady(filePath);
  }
}
