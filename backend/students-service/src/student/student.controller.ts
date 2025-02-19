import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { FileUploadInterceptor } from 'src/common/interceptors/file-upload.interceptor';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('student')
export class StudentController {
  constructor(private readonly studentsService: StudentService) {}

  @Post('import')
  @UseInterceptors(FileUploadInterceptor)
  async importStudents(@UploadedFile() file: Express.Multer.File) {
    const job = await this.studentsService.createStudentImportJob(file.path);
    return { jobId: job.id };
  }

  @Post('filter')
  async filterStudentsByAge(
    @Body('minAge') minAge: number,
    @Body('maxAge') maxAge: number,
  ) {
    return await this.studentsService.filterStudentsByAge(minAge, maxAge);
  }

  @Get('download')
  async downloadFile(
    @Query('filePath') filePath: string,
    @Res() res: Response,
  ) {
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).send('File not found');
    }
  }
}
