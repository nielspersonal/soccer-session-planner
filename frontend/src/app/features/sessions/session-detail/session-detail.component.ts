import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { SessionService, Session } from '../../../core/services/session.service';
import { DiagramEditorComponent } from '../../../shared/diagram-editor/diagram-editor.component';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DiagramEditorComponent
  ],
  template: `
    <div class="container">
      @if (session) {
        <div class="header">
          <div>
            <h1>{{ session.title }}</h1>
            <div class="session-meta">
              @if (session.date) {
                <span><mat-icon>event</mat-icon> {{ session.date | date }}</span>
              }
              <span><mat-icon>schedule</mat-icon> {{ session.totalDuration }} min</span>
              @if (session.team) {
                <span><mat-icon>group</mat-icon> {{ session.team }}</span>
              }
            </div>
          </div>
          <div class="actions">
            <button mat-raised-button color="primary" [routerLink]="['/sessions', session.id, 'edit']">
              <mat-icon>edit</mat-icon>
              Edit Session
            </button>
            <button mat-button routerLink="/sessions">
              <mat-icon>arrow_back</mat-icon>
              Back
            </button>
          </div>
        </div>

        @if (session.theme) {
          <mat-card class="theme-card">
            <mat-card-header>
              <mat-card-title>Session Theme</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ session.theme }}</p>
            </mat-card-content>
          </mat-card>
        }

        @if (session.notes) {
          <mat-card class="notes-card">
            <mat-card-header>
              <mat-card-title>Notes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ session.notes }}</p>
            </mat-card-content>
          </mat-card>
        }

        <div class="drills-section">
          <h2>Drills ({{ session.sessionDrills?.length || 0 }})</h2>
          
          @if (session.sessionDrills && session.sessionDrills.length > 0) {
            <div class="drills-list">
              @for (sessionDrill of session.sessionDrills; track sessionDrill.id; let idx = $index) {
                <mat-card class="drill-card">
                  <mat-card-header>
                    <div class="drill-number">{{ idx + 1 }}</div>
                    <mat-card-title>{{ sessionDrill.drill.title }}</mat-card-title>
                    <mat-card-subtitle>
                      <mat-icon>schedule</mat-icon>
                      {{ sessionDrill.durationOverride || sessionDrill.drill.durationMinutes }} minutes
                    </mat-card-subtitle>
                  </mat-card-header>
                  
                  <mat-card-content>
                    @if (sessionDrill.drill.objective) {
                      <div class="drill-section">
                        <strong>Objective:</strong>
                        <p>{{ sessionDrill.drill.objective }}</p>
                      </div>
                    }

                    @if (sessionDrill.drill.ageGroup) {
                      <div class="drill-section">
                        <strong>Age Group:</strong>
                        <mat-chip>{{ sessionDrill.drill.ageGroup }}</mat-chip>
                      </div>
                    }

                    @if (sessionDrill.drill.notes) {
                      <div class="drill-section">
                        <strong>Notes:</strong>
                        <p>{{ sessionDrill.drill.notes }}</p>
                      </div>
                    }

                    @if (sessionDrill.sessionNotes) {
                      <div class="drill-section session-notes">
                        <strong>Session-Specific Notes:</strong>
                        <p>{{ sessionDrill.sessionNotes }}</p>
                      </div>
                    }

                    @if (sessionDrill.drill.diagramJson) {
                      <div class="drill-section diagram-section">
                        <strong>Diagram:</strong>
                        <div class="diagram-viewer">
                          <app-diagram-editor 
                            [initialData]="sessionDrill.drill.diagramJson"
                            [readOnly]="true">
                          </app-diagram-editor>
                        </div>
                      </div>
                    }

                    @if (sessionDrill.drill.tags && sessionDrill.drill.tags.length > 0) {
                      <div class="drill-section">
                        <strong>Tags:</strong>
                        <div class="tags">
                          @for (tag of sessionDrill.drill.tags; track tag) {
                            <mat-chip>{{ tag }}</mat-chip>
                          }
                        </div>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
          } @else {
            <mat-card class="empty-state">
              <mat-card-content>
                <mat-icon>sports_soccer</mat-icon>
                <p>No drills added to this session yet.</p>
                <button mat-raised-button color="primary" [routerLink]="['/sessions', session.id, 'edit']">
                  Add Drills
                </button>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 20px;
    }

    .header h1 {
      margin: 0 0 12px 0;
    }

    .session-meta {
      display: flex;
      gap: 20px;
      color: #666;
      flex-wrap: wrap;
    }

    .session-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .session-meta mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .theme-card,
    .notes-card {
      margin-bottom: 24px;
    }

    .drills-section {
      margin-top: 32px;
    }

    .drills-section h2 {
      margin-bottom: 20px;
    }

    .drills-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .drill-card {
      position: relative;
    }

    .drill-card mat-card-header {
      position: relative;
      padding-left: 60px;
    }

    .drill-number {
      position: absolute;
      left: 16px;
      top: 16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
    }

    .drill-section {
      margin-bottom: 16px;
    }

    .drill-section:last-child {
      margin-bottom: 0;
    }

    .drill-section strong {
      display: block;
      margin-bottom: 8px;
      color: #333;
    }

    .drill-section p {
      margin: 0;
      color: #666;
    }

    .session-notes {
      background: #e3f2fd;
      padding: 12px;
      border-radius: 4px;
      border-left: 4px solid #1976d2;
    }

    .diagram-section {
      margin-top: 20px;
    }

    .diagram-viewer {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 8px;
      height: 500px;
    }

    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 20px;
    }

    @media print {
      .header .actions,
      .drill-card mat-card-actions {
        display: none;
      }
    }
  `]
})
export class SessionDetailComponent implements OnInit {
  private sessionService = inject(SessionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  session?: Session;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSession(+id);
    }
  }

  loadSession(id: number) {
    this.sessionService.getOne(id).subscribe(session => {
      this.session = session;
    });
  }
}
