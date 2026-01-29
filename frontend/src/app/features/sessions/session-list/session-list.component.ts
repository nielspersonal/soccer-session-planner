import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SessionService, Session } from '../../../core/services/session.service';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>My Sessions</h1>
        <button mat-raised-button color="primary" routerLink="/sessions/new">
          <mat-icon>add</mat-icon>
          New Session
        </button>
      </div>

      <div class="sessions-list">
        @for (session of sessions; track session.id) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ session.title }}</mat-card-title>
              <mat-card-subtitle>
                @if (session.date) { {{ session.date | date }} • }
                {{ session.totalDuration }} min
                @if (session.team) { • {{ session.team }} }
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (session.theme) {
                <p><strong>Theme:</strong> {{ session.theme }}</p>
              }
              @if (session.sessionDrills && session.sessionDrills.length > 0) {
                <p><strong>Drills:</strong> {{ session.sessionDrills.length }}</p>
              }
            </mat-card-content>
            <mat-card-actions>
              <button mat-button [routerLink]="['/sessions', session.id]">
                <mat-icon>visibility</mat-icon>
                View
              </button>
              <button mat-button (click)="exportPDF(session.id)">
                <mat-icon>picture_as_pdf</mat-icon>
                PDF
              </button>
              <button mat-button color="warn" (click)="deleteSession(session.id)">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  `]
})
export class SessionListComponent implements OnInit {
  private sessionService = inject(SessionService);
  sessions: Session[] = [];

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getAll().subscribe(sessions => {
      this.sessions = sessions;
    });
  }

  exportPDF(id: number) {
    this.sessionService.exportPDF(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  deleteSession(id: number) {
    if (confirm('Are you sure you want to delete this session?')) {
      this.sessionService.delete(id).subscribe(() => {
        this.loadSessions();
      });
    }
  }
}
