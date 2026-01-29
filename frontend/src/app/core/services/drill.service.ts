import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Drill {
  id: number;
  title: string;
  objective?: string;
  ageGroup?: string;
  durationMinutes: number;
  notes?: string;
  tags: string[];
  diagramJson?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDrillDto {
  title: string;
  objective?: string;
  ageGroup?: string;
  durationMinutes: number;
  notes?: string;
  tags?: string[];
  diagramJson?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DrillService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/drills';

  getAll(): Observable<Drill[]> {
    return this.http.get<Drill[]>(this.API_URL);
  }

  getOne(id: number): Observable<Drill> {
    return this.http.get<Drill>(`${this.API_URL}/${id}`);
  }

  create(drill: CreateDrillDto): Observable<Drill> {
    return this.http.post<Drill>(this.API_URL, drill);
  }

  update(id: number, drill: Partial<CreateDrillDto>): Observable<Drill> {
    return this.http.patch<Drill>(`${this.API_URL}/${id}`, drill);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
