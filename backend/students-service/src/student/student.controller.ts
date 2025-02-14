import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { FileUploadInterceptor } from 'src/common/interceptors/file-upload.interceptor';

@Controller('student')
export class StudentController {
  constructor(private readonly studentsService: StudentService) {}

  @Post('import')
  @UseInterceptors(FileUploadInterceptor)
  async importStudents(@UploadedFile() file: Express.Multer.File) {
    try {
      const job = await this.studentsService.createStudentImportJob(file.path);
      return { jobId: job.id };
    } catch (error) {
      throw error;
    }
  }
}
