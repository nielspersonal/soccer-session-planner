import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DrillService } from '../../../core/services/drill.service';
import { DiagramEditorComponent } from '../../../shared/diagram-editor/diagram-editor.component';

@Component({
  selector: 'app-drill-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    DiagramEditorComponent
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Drill' : 'New Drill' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="drillForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" required>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Objective</mat-label>
              <textarea matInput formControlName="objective" rows="2"></textarea>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Age Group</mat-label>
              <input matInput formControlName="ageGroup" placeholder="e.g., U12, U14">
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Duration (minutes)</mat-label>
              <input matInput type="number" formControlName="durationMinutes" required>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Notes</mat-label>
              <textarea matInput formControlName="notes" rows="4"></textarea>
            </mat-form-field>

            <div class="diagram-section">
              <h3>Drill Diagram</h3>
              <app-diagram-editor 
                [initialData]="drillForm.get('diagramJson')?.value"
                (diagramChange)="onDiagramChange($event)">
              </app-diagram-editor>
            </div>

            <div class="actions">
              <button mat-button type="button" (click)="cancel()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="drillForm.invalid">
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
    .diagram-section {
      margin: 24px 0;
    }
    .diagram-section h3 {
      margin-bottom: 12px;
      color: #333;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class DrillFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private drillService = inject(DrillService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  drillId?: number;

  drillForm = this.fb.group({
    title: ['', Validators.required],
    objective: [''],
    ageGroup: [''],
    durationMinutes: [15, [Validators.required, Validators.min(1)]],
    notes: [''],
    tags: [[] as string[]],
    diagramJson: [null]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.drillId = +id;
      this.loadDrill(this.drillId);
    }
  }

  loadDrill(id: number) {
    this.drillService.getOne(id).subscribe(drill => {
      this.drillForm.patchValue(drill);
    });
  }

  onSubmit() {
    if (this.drillForm.valid) {
      const drillData = this.drillForm.value;
      console.log('Submitting drill data:', drillData);
      console.log('DiagramJson in submission:', drillData.diagramJson);

      if (this.isEditMode && this.drillId) {
        this.drillService.update(this.drillId, drillData as any).subscribe(() => {
          this.router.navigate(['/drills']);
        });
      } else {
        this.drillService.create(drillData as any).subscribe(() => {
          this.router.navigate(['/drills']);
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/drills']);
  }

  onDiagramChange(diagramData: any) {
    console.log('Diagram changed:', diagramData);
    this.drillForm.patchValue({
      diagramJson: diagramData
    });
    console.log('Form value after patch:', this.drillForm.value.diagramJson);
  }
}
