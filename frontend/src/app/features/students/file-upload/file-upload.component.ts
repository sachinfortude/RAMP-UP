import { Component, OnDestroy, OnInit } from '@angular/core';
import { StudentsService } from '../../../core/services/students.service';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../core/services/websocket.service';
import { KENDO_NOTIFICATION } from '@progress/kendo-angular-notification';
import { NotificationService } from '@progress/kendo-angular-notification';

@Component({
  selector: 'app-file-upload',
  imports: [KENDO_BUTTONS, KENDO_NOTIFICATION],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent implements OnInit, OnDestroy {
  selectedFile: File | null = null;
  private jobCompletedSub!: Subscription;
  private jobFailedSub!: Subscription;
  isImporting: boolean = false;

  constructor(
    private studentsService: StudentsService,
    private webSocketService: WebsocketService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Subscribe to job completion event
    this.jobCompletedSub = this.webSocketService
      .onJobCompleted()
      .subscribe((message) => {
        this.isImporting = false;
        this.notificationService.show({
          content: message,
          hideAfter: 600,
          position: { horizontal: 'right', vertical: 'top' },
          animation: { type: 'fade', duration: 400 },
          type: { style: 'success', icon: true },
        });
      });

    // Subscribe to job failure event
    this.jobFailedSub = this.webSocketService
      .onJobFailed()
      .subscribe((message) => {
        this.isImporting = false;
        this.notificationService.show({
          content: message,
          hideAfter: 600,
          position: { horizontal: 'right', vertical: 'top' },
          animation: { type: 'fade', duration: 400 },
          type: { style: 'error', icon: true },
        });
      });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    this.isImporting = true;
    if (this.selectedFile) {
      this.studentsService.importStudents(this.selectedFile).subscribe({
        next: (res) => {
          console.log('File uploaded successfully to the queue:', res);
        },
        error: (err) => {
          console.log('File upload failed:', err);
        },
      });
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.jobCompletedSub) this.jobCompletedSub.unsubscribe();
    if (this.jobFailedSub) this.jobFailedSub.unsubscribe();
    this.webSocketService.disconnect();
  }
}
