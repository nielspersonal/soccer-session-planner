import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { SessionService } from '../../../core/services/session.service';
import { DrillService, Drill } from '../../../core/services/drill.service';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Session' : 'New Session' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="sessionForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" required>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Team</mat-label>
              <input matInput formControlName="team" placeholder="e.g., U14 Boys">
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Total Duration (minutes)</mat-label>
              <input matInput type="number" formControlName="totalDuration" required>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Theme</mat-label>
              <input matInput formControlName="theme" placeholder="e.g., Attacking Play">
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Notes</mat-label>
              <textarea matInput formControlName="notes" rows="4"></textarea>
            </mat-form-field>

            @if (isEditMode) {
              <div class="drills-section">
                <h3>Drills in this Session</h3>
                
                <div class="add-drill">
                  <mat-form-field class="drill-select">
                    <mat-label>Add Drill</mat-label>
                    <mat-select [(value)]="selectedDrillId">
                      @for (drill of availableDrills; track drill.id) {
                        <mat-option [value]="drill.id">{{ drill.title }} ({{ drill.durationMinutes }}min)</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <button mat-raised-button color="primary" type="button" 
                          (click)="addDrill()" [disabled]="!selectedDrillId">
                    <mat-icon>add</mat-icon> Add
                  </button>
                </div>

                <mat-list>
                  @for (sessionDrill of sessionDrills; track sessionDrill.id) {
                    <mat-list-item>
                      <span matListItemTitle>{{ sessionDrill.drill.title }}</span>
                      <span matListItemLine>{{ sessionDrill.durationOverride || sessionDrill.drill.durationMinutes }} minutes</span>
                      <button mat-icon-button matListItemMeta (click)="removeDrill(sessionDrill.id)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </mat-list-item>
                  }
                </mat-list>
              </div>
            }

            <div class="actions">
              <button mat-button type="button" (click)="cancel()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="sessionForm.invalid">
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    mat-form-field {
      margin-bottom: 16px;
    }
    .drills-section {
      margin: 24px 0;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .drills-section h3 {
      margin-top: 0;
      margin-bottom: 16px;
    }
    .add-drill {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
    }
    .drill-select {
      flex: 1;
      margin-bottom: 0;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class SessionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private drillService = inject(DrillService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  sessionId?: number;
  availableDrills: Drill[] = [];
  sessionDrills: any[] = [];
  selectedDrillId?: number;

  sessionForm = this.fb.group({
    title: ['', Validators.required],
    date: [null as Date | null],
    team: [''],
    totalDuration: [90, [Validators.required, Validators.min(1)]],
    theme: [''],
    notes: ['']
  });

  ngOnInit() {
    this.loadDrills();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.sessionId = +id;
      this.loadSession(this.sessionId);
    }
  }

  loadDrills() {
    this.drillService.getAll().subscribe(drills => {
      this.availableDrills = drills;
    });
  }

  loadSession(id: number) {
    this.sessionService.getOne(id).subscribe(session => {
      this.sessionForm.patchValue({
        title: session.title,
        date: session.date ? new Date(session.date) : null,
        team: session.team,
        totalDuration: session.totalDuration,
        theme: session.theme,
        notes: session.notes
      });
      this.sessionDrills = session.sessionDrills || [];
    });
  }

  addDrill() {
    if (!this.selectedDrillId || !this.sessionId) return;

    this.sessionService.addDrill(this.sessionId, {
      drillId: this.selectedDrillId
    }).subscribe(() => {
      this.loadSession(this.sessionId!);
      this.selectedDrillId = undefined;
    });
  }

  removeDrill(sessionDrillId: number) {
    if (confirm('Remove this drill from the session?')) {
      this.sessionService.removeDrill(sessionDrillId).subscribe(() => {
        this.loadSession(this.sessionId!);
      });
    }
  }

  onSubmit() {
    if (this.sessionForm.valid) {
      const sessionData = this.sessionForm.value;

      if (this.isEditMode && this.sessionId) {
        this.sessionService.update(this.sessionId, sessionData as any).subscribe(() => {
          this.router.navigate(['/sessions']);
        });
      } else {
        this.sessionService.create(sessionData as any).subscribe((session) => {
          // After creating, redirect to edit mode to add drills
          this.router.navigate(['/sessions', session.id]);
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/sessions']);
  }
}
