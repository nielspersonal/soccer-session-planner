import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DrillService, Drill } from '../../../core/services/drill.service';

@Component({
  selector: 'app-drill-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>My Drills</h1>
        <button mat-raised-button color="primary" routerLink="/drills/new">
          <mat-icon>add</mat-icon>
          New Drill
        </button>
      </div>

      <div class="drills-grid">
        @for (drill of drills; track drill.id) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ drill.title }}</mat-card-title>
              <mat-card-subtitle>{{ drill.durationMinutes }} min @if (drill.ageGroup) { • {{ drill.ageGroup }} }</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (drill.objective) {
                <p>{{ drill.objective }}</p>
              }
              @if (drill.tags.length > 0) {
                <mat-chip-set>
                  @for (tag of drill.tags; track tag) {
                    <mat-chip>{{ tag }}</mat-chip>
                  }
                </mat-chip-set>
              }
            </mat-card-content>
            <mat-card-actions>
              <button mat-button [routerLink]="['/drills', drill.id]">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-button color="warn" (click)="deleteDrill(drill.id)">
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
    .drills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
  `]
})
export class DrillListComponent implements OnInit {
  private drillService = inject(DrillService);
  drills: Drill[] = [];

  ngOnInit() {
    this.loadDrills();
  }

  loadDrills() {
    this.drillService.getAll().subscribe(drills => {
      this.drills = drills;
    });
  }

  deleteDrill(id: number) {
    if (confirm('Are you sure you want to delete this drill?')) {
      this.drillService.delete(id).subscribe(() => {
        this.loadDrills();
      });
    }
  }
}
