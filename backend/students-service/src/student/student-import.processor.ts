import { Processor, WorkerHost } from '@nestjs/bullmq';
import { StudentService } from './student.service';
import { Job } from 'bullmq';
import * as xlsx from 'xlsx';
import { CreateStudentInput } from './dto/create-student.input';
import { StudentGateway } from './student.gateway';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';

/*    This processor is responsible for handling the student import job asynchronously.
      Importing students from a file can be a time-consuming operation.
      Instead of blocking the HTTP request (causing a delay for the user), the job is processed in the background. 
*/
@Processor('student-import')
export class StudentImportProcessor extends WorkerHost {
  private readonly logger = new Logger(StudentImportProcessor.name);

  constructor(
    private readonly studentsService: StudentService,
    private readonly studentGateway: StudentGateway,
  ) {
    super();
  }

  async process(job: Job, token?: string): Promise<any> {
    const filePath = job.data.filePath;
    this.logger.log(`Processing file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      this.logger.log(`File not found: ${filePath}`);
      this.studentGateway.notifyJobFailed(
        'Student import failed: File not found!',
      );
      throw new Error('File not found');
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json<CreateStudentInput>(sheet, {
      raw: false,
    });

    try {
      for (const row of data) {
        const student = {
          firstName: row.firstName,
          lastName: row.lastName,
          dateOfBirth: row.dateOfBirth,
          email: row.email,
          courseId: row.courseId,
        };
        await this.studentsService.create(student);
      }
      this.logger.log('Students data imported successfully');
      this.studentGateway.notifyJobCompleted('Students imported successfully!');
    } catch (error) {
      this.logger.log(`Error importing students: ${error.message}`);
      this.studentGateway.notifyJobFailed('Student import failed!');
      throw error; // Retry the job
    }
  }
}
