import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../core/services/websocket.service';
import { StudentsService } from '../../../core/services/students.service';
import { FormsModule } from '@angular/forms';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { filterIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { KENDO_DIALOGS } from '@progress/kendo-angular-dialog';
import { KENDO_INDICATORS } from '@progress/kendo-angular-indicators';
import { NgIf } from '@angular/common';
import { KENDO_NOTIFICATION } from '@progress/kendo-angular-notification';
import { NotificationService } from '@progress/kendo-angular-notification';

@Component({
  selector: 'app-students-filter',
  imports: [
    FormsModule,
    KENDO_BUTTONS,
    KENDO_DIALOGS,
    KENDO_INDICATORS,
    NgIf,
    KENDO_NOTIFICATION,
  ],
  templateUrl: './students-filter.component.html',
  styleUrl: './students-filter.component.css',
})
export class StudentsFilterComponent implements OnInit, OnDestroy {
  minAge?: number;
  maxAge?: number;
  fileReadySubscription?: Subscription;
  isOpen = false;
  svgFilter: SVGIcon = filterIcon;
  isSubmitting = false;
  hasStudents = computed(() => this.studentService.studentCount() > 0); // Use a computed signal to determine if students exist

  constructor(
    private websocketService: WebsocketService,
    private studentService: StudentsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Listen for file ready events
    this.fileReadySubscription = this.websocketService.onFileReady().subscribe({
      next: (data) => {
        this.isSubmitting = false;
        this.isOpen = false;
        this.downloadFile(data.filePath);
        this.notificationService.show({
          content: 'Students filtered and file downloaded successfully.',
          hideAfter: 600,
          position: { horizontal: 'right', vertical: 'top' },
          animation: { type: 'fade', duration: 400 },
          type: { style: 'success', icon: true },
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.isOpen = false;
        console.error('Failed to filter students:', error);
        this.notificationService.show({
          content: 'Failed to filter students.',
          hideAfter: 600,
          position: { horizontal: 'right', vertical: 'top' },
          animation: { type: 'fade', duration: 400 },
          type: { style: 'error', icon: true },
        });
      },
    });
  }

  open(): void {
    this.isOpen = true;
  }

  close(status: string): void {
    this.isOpen = false;
  }

  filterStudents() {
    if (this.minAge && this.maxAge) {
      this.isSubmitting = true;
      this.studentService.filterStudents(this.minAge, this.maxAge).subscribe({
        next: (response) => {
          console.log('Filter process started:', response);
        },
        error: (error) => {
          console.error('Error starting filter process:', error);
        },
      });
    } else {
      alert('Please enter both minAge and maxAge.');
    }
  }

  downloadFile(filePath: string) {
    this.studentService.downloadFile(filePath).subscribe({
      next: (blob) => {
        // Create a link element to trigger the download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath.split('/').pop() || 'filtered-students.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
      },
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.fileReadySubscription) {
      this.fileReadySubscription.unsubscribe();
    }
  }
}
