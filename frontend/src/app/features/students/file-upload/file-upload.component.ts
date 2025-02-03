import { Component } from '@angular/core';
import { StudentsService } from '../../../core/services/students.service';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';

@Component({
  selector: 'app-file-upload',
  imports: [KENDO_BUTTONS],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent {
  selectedFile: File | null = null;

  constructor(private studentsService: StudentsService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      this.studentsService.importStudents(this.selectedFile).subscribe({
        next: (res) => {
          console.log('File uploaded successfully:', res);
        },
        error: (err) => {
          console.log('File upload failed:', err);
        },
      });
    }
  }
}
