import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicMenu } from '../models/public-menu.model';

@Injectable({ providedIn: 'root' })
export class PublicMenuService {
  private apiUrl = `${environment.apiUrl}/public`;

  constructor(private http: HttpClient) {}

  getMenu(slug: string): Observable<PublicMenu> {
    return this.http.get<PublicMenu>(`${this.apiUrl}/menu/${slug}`);
  }
}