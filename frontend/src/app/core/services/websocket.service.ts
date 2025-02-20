import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.webSocketUrl);
  }

  // Listen for job completion events
  onJobCompleted(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('jobCompleted', (data: { message: string }) => {
        observer.next(data.message);
      });
    });
  }

  // Listen for job failure events
  onJobFailed(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('jobFailed', (data: { message: string }) => {
        observer.next(data.message);
      });
    });
  }

  // Listen for file ready events
  onFileReady(): Observable<{ filePath: string }> {
    return new Observable((observer) => {
      this.socket.on('fileReady', (data: { filePath: string }) => {
        observer.next(data);
      });
    });
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
