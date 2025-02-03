import { Processor, WorkerHost } from '@nestjs/bullmq';
import { StudentService } from './student.service';
import { Job } from 'bullmq';
import * as xlsx from 'xlsx';
import { CreateStudentInput } from './dto/create-student.input';
import { StudentGateway } from './student.gateway';

@Processor('student-import')
export class StudentImportProcessor extends WorkerHost {
  constructor(
    private readonly studentsService: StudentService,
    private readonly studentGateway: StudentGateway,
  ) {
    super();
  }

  async process(job: Job, token?: string): Promise<any> {
    const file = job.data.file;
    console.log('File buffer length:', file?.buffer?.data?.length);
    const workbook = xlsx.read(file.buffer.data, { type: 'buffer' });
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

      console.log('Students data imported successfully from the file');
      this.studentGateway.notifyJobCompleted('Students imported successfully!');
    } catch (error) {
      console.log('Error occured importing students from file.', error.message);
      this.studentGateway.notifyJobFailed('Student import failed!');
      throw error; // Retry the Job
    }
  }
}
