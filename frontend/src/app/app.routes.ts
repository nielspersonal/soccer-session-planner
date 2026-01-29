import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'drills',
    canActivate: [authGuard],
    loadComponent: () => import('./features/drills/drill-list/drill-list.component').then(m => m.DrillListComponent)
  },
  {
    path: 'drills/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/drills/drill-form/drill-form.component').then(m => m.DrillFormComponent)
  },
  {
    path: 'drills/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/drills/drill-form/drill-form.component').then(m => m.DrillFormComponent)
  },
  {
    path: 'sessions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/sessions/session-list/session-list.component').then(m => m.SessionListComponent)
  },
  {
    path: 'sessions/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/sessions/session-form/session-form.component').then(m => m.SessionFormComponent)
  },
  {
    path: 'sessions/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/sessions/session-detail/session-detail.component').then(m => m.SessionDetailComponent)
  },
  {
    path: '',
    redirectTo: '/drills',
    pathMatch: 'full'
  }
];
