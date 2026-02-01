import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Drill } from './drill.service';
import { AuthService } from './auth.service';

export interface SessionDrill {
  id: number;
  drill: Drill;
  order: number;
  durationOverride?: number;
  sessionNotes?: string;
}

export interface Session {
  id: number;
  title: string;
  date?: string;
  team?: string;
  totalDuration: number;
  theme?: string;
  notes?: string;
  sessionDrills?: SessionDrill[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionDto {
  title: string;
  date?: string;
  team?: string;
  totalDuration: number;
  theme?: string;
  notes?: string;
}

export interface AddDrillToSessionDto {
  drillId: number;
  durationOverride?: number;
  sessionNotes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_URL = '/api/sessions';

  getAll(): Observable<Session[]> {
    return this.http.get<Session[]>(this.API_URL);
  }

  getOne(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.API_URL}/${id}`);
  }

  create(session: CreateSessionDto): Observable<Session> {
    return this.http.post<Session>(this.API_URL, session);
  }

  update(id: number, session: Partial<CreateSessionDto>): Observable<Session> {
    return this.http.patch<Session>(`${this.API_URL}/${id}`, session);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  addDrill(sessionId: number, dto: AddDrillToSessionDto): Observable<SessionDrill> {
    return this.http.post<SessionDrill>(`${this.API_URL}/${sessionId}/drills`, dto);
  }

  updateSessionDrill(sessionDrillId: number, dto: Partial<AddDrillToSessionDto>): Observable<SessionDrill> {
    return this.http.patch<SessionDrill>(`${this.API_URL}/drills/${sessionDrillId}`, dto);
  }

  removeDrill(sessionDrillId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/drills/${sessionDrillId}`);
  }

  exportPDF(sessionId: number): Observable<Blob> {
    return this.http.get(`/api/export/session/${sessionId}/pdf`, {
      responseType: 'blob'
    });
  }

  getPrintUrl(sessionId: number): string {
    const token = this.authService.getToken();
    return `/api/export/session/${sessionId}/print?token=${encodeURIComponent(token || '')}`;
  }
}
