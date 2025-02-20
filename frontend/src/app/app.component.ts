import { Component } from '@angular/core';
import { StudentsComponent } from './features/students/students.component';
import { FileUploadComponent } from './features/students/file-upload/file-upload.component';
import { StudentsFilterComponent } from './features/students/students-filter/students-filter.component';

@Component({
  selector: 'app-root',
  imports: [StudentsComponent, FileUploadComponent, StudentsFilterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
