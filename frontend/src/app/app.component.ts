import { Component } from '@angular/core';
import { StudentsComponent } from './features/students/students.component';
import { FileUploadComponent } from './features/students/file-upload/file-upload.component';

@Component({
  selector: 'app-root',
  imports: [StudentsComponent, FileUploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
