import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';
  
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);

  constructor() {
    this.checkAuth();
  }

  private checkAuth() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      this.isAuthenticated.set(true);
      this.currentUser.set(JSON.parse(userStr));
    }
  }

  register(email: string, password: string, name: string) {
    return this.http.post<AuthResponse>('/api/auth/register', { email, password, name })
      .pipe(
        tap(response => this.handleAuth(response))
      );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(
        tap(response => this.handleAuth(response))
      );
  }

  private handleAuth(response: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.isAuthenticated.set(true);
    this.currentUser.set(response.user);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
