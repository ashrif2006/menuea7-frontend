import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  private currentUserSignal = signal<{ fullName: string; cafeName: string } | null>(null);

  isLoggedIn = computed(() => this.currentUserSignal() !== null);
  currentUser = computed(() => this.currentUserSignal());

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('cafeName');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(response: AuthResponse) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('fullName', response.fullName);
    localStorage.setItem('cafeName', response.cafName);

    this.currentUserSignal.set({
      fullName: response.fullName,
      cafeName: response.cafName
    });
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const fullName = localStorage.getItem('fullName');
    const cafeName = localStorage.getItem('cafeName');

    if (token && fullName && cafeName) {
      this.currentUserSignal.set({ fullName, cafeName });
    }
  }
}