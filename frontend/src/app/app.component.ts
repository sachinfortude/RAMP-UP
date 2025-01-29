import { Component } from '@angular/core';
import { StudentsComponent } from './features/students/students.component';

@Component({
  selector: 'app-root',
  imports: [StudentsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
