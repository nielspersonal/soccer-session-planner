import { Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { SessionService, Session, SessionDrill } from '../../../core/services/session.service';
import { DiagramEditorComponent } from '../../../shared/diagram-editor/diagram-editor.component';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    DiagramEditorComponent
  ],
  template: `
    <div class="container" #sessionContent>
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
            @if (!isPreviewMode) {
              <button mat-raised-button color="primary" [routerLink]="['/sessions', session.id, 'edit']">
                <mat-icon>edit</mat-icon>
                Edit Session
              </button>
              <button mat-raised-button color="accent" (click)="previewSession()">
                <mat-icon>preview</mat-icon>
                Preview
              </button>
            }
            <button mat-raised-button color="primary" (click)="exportPDF()">
              <mat-icon>picture_as_pdf</mat-icon>
              Export PDF
            </button>
            <button mat-raised-button (click)="printSession()">
              <mat-icon>print</mat-icon>
              Print
            </button>
            @if (!isPreviewMode) {
              <button mat-button routerLink="/sessions">
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
            } @else {
              <button mat-button (click)="closePreview()">
                <mat-icon>close</mat-icon>
                Close
              </button>
            }
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

                    @if (!isPreviewMode) {
                      <div class="drill-section duration-edit">
                        <mat-form-field appearance="outline">
                          <mat-label>Duration Override (minutes)</mat-label>
                          <input matInput 
                                 type="number"
                                 [(ngModel)]="sessionDrill.durationOverride"
                                 (blur)="updateSessionDrill(sessionDrill)"
                                 [placeholder]="sessionDrill.drill.durationMinutes.toString()">
                          <mat-hint>Leave empty to use default ({{ sessionDrill.drill.durationMinutes }} min)</mat-hint>
                        </mat-form-field>
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

                    @if (!isPreviewMode) {
                      <div class="drill-section session-notes-edit">
                        <mat-form-field class="full-width" appearance="outline">
                          <mat-label>Session-Specific Notes</mat-label>
                          <textarea matInput 
                                    rows="3"
                                    [(ngModel)]="sessionDrill.sessionNotes"
                                    (blur)="updateSessionDrill(sessionDrill)"
                                    placeholder="Add notes specific to this session..."></textarea>
                        </mat-form-field>
                      </div>
                    } @else {
                      @if (sessionDrill.sessionNotes) {
                        <div class="drill-section session-notes-display">
                          <strong>Session Notes:</strong>
                          <p>{{ sessionDrill.sessionNotes }}</p>
                        </div>
                      }
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
      margin-bottom: 32px;
      gap: 20px;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header h1 {
      margin: 0 0 12px 0;
      font-size: 32px;
      font-weight: 600;
    }

    .session-meta {
      display: flex;
      gap: 20px;
      color: rgba(255, 255, 255, 0.95);
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
      color: rgba(255, 255, 255, 0.9);
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .theme-card,
    .notes-card {
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e0e0e0;
    }

    .drills-section {
      margin-top: 32px;
    }

    .drills-section h2 {
      margin-bottom: 24px;
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
    }

    .drills-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .drill-card {
      position: relative;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e0e0e0;
      transition: box-shadow 0.3s ease;
    }

    .drill-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .drill-card mat-card-header {
      position: relative;
      padding-left: 60px;
    }

    .drill-number {
      position: absolute;
      left: 16px;
      top: 16px;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
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

    .session-notes-edit {
      background: linear-gradient(135deg, #fff9e6 0%, #fff3e0 100%);
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
      margin-top: 16px;
      box-shadow: 0 2px 4px rgba(255, 152, 0, 0.1);
    }

    .session-notes-edit mat-form-field {
      width: 100%;
    }

    .duration-edit {
      margin-top: 12px;
    }

    .duration-edit mat-form-field {
      width: 200px;
    }

    .session-notes-display {
      background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
      margin-top: 16px;
      box-shadow: 0 2px 4px rgba(255, 152, 0, 0.1);
    }

    .session-notes-display p {
      margin: 0;
      white-space: pre-wrap;
    }

    .diagram-section {
      margin-top: 20px;
    }

    .diagram-viewer {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      margin-top: 12px;
      height: 500px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body {
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 100%;
        padding: 20px;
      }

      .header .actions {
        display: none !important;
      }

      .header {
        margin-bottom: 20px;
        page-break-after: avoid;
      }

      .header h1 {
        font-size: 28px;
        margin-bottom: 10px;
      }

      .theme-card,
      .notes-card {
        margin-bottom: 20px;
        page-break-inside: avoid;
      }

      .drills-section h2 {
        font-size: 24px;
        margin-bottom: 15px;
      }

      .drill-card {
        page-break-inside: avoid;
        margin-bottom: 20px;
        border: 1px solid #ddd !important;
        box-shadow: none !important;
      }

      .session-notes-edit {
        background: #fff3cd !important;
        padding: 12px;
        margin-top: 12px;
      }

      .session-notes-edit mat-form-field {
        display: block;
      }

      .session-notes-edit textarea {
        border: 1px solid #ddd;
        padding: 8px;
        width: 100%;
        font-family: inherit;
      }

      .duration-edit mat-form-field {
        display: block;
        margin-top: 8px;
      }

      .duration-edit input {
        border: 1px solid #ddd;
        padding: 8px;
        width: 200px;
      }

      .diagram-viewer {
        border: 2px solid #e0e0e0 !important;
        margin-top: 15px;
      }

      mat-card {
        box-shadow: none !important;
      }
    }
  `]
})
export class SessionDetailComponent implements OnInit {
  private sessionService = inject(SessionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('sessionContent', { static: false }) sessionContent?: ElementRef;
  
  session?: Session;
  isPreviewMode = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isPreviewMode = this.route.snapshot.queryParamMap.get('preview') === 'true';
    if (id) {
      this.loadSession(+id);
    }
  }

  loadSession(id: number) {
    this.sessionService.getOne(id).subscribe(session => {
      this.session = session;
    });
  }

  updateSessionDrill(sessionDrill: SessionDrill) {
    this.sessionService.updateSessionDrill(sessionDrill.id, {
      sessionNotes: sessionDrill.sessionNotes,
      durationOverride: sessionDrill.durationOverride || undefined
    }).subscribe(() => {
      console.log('Session drill updated');
    });
  }

  previewSession() {
    if (this.session) {
      // Open current page in new window with preview mode
      const url = `/sessions/${this.session.id}?preview=true`;
      window.open(url, '_blank');
    }
  }

  printSession() {
    window.print();
  }

  closePreview() {
    window.close();
  }

  async exportPDF() {
    if (!this.session || !this.sessionContent) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const element = this.sessionContent.nativeElement;
      
      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`session-${this.session.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }
}
