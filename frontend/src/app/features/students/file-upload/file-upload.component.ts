import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StudentsService } from '../../../core/services/students.service';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../core/services/websocket.service';
import { KENDO_NOTIFICATION } from '@progress/kendo-angular-notification';
import { NotificationService } from '@progress/kendo-angular-notification';
import { KENDO_INDICATORS } from '@progress/kendo-angular-indicators';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  imports: [KENDO_BUTTONS, KENDO_NOTIFICATION, KENDO_INDICATORS, NgIf],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput: any;
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
    this.subscribeToJobCompletion();
    this.subscribeToJobFailure();
  }

  private subscribeToJobCompletion(): void {
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
        this.resetFileInput();
      });
  }

  private subscribeToJobFailure(): void {
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
        this.resetFileInput();
      });
  }

  private resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Clear file input
      this.selectedFile = null;
    }
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
