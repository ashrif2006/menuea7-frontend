import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '../models/menu-item.model';

@Injectable({ providedIn: 'root' })
export class MenuItemService {
  private apiUrl = `${environment.apiUrl}/MenuItem`;

  private menuItemsSignal = signal<MenuItem[]>([]);
  menuItems = this.menuItemsSignal.asReadonly();

  private loadedOnce = false;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MenuItem[]> {
    if (this.loadedOnce) {
      return new Observable(observer => {
        observer.next(this.menuItemsSignal());
        observer.complete();
      });
    }

    return this.http.get<MenuItem[]>(this.apiUrl).pipe(
      tap(data => {
        this.menuItemsSignal.set(data);
        this.loadedOnce = true;
      })
    );
  }

  create(request: CreateMenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, request).pipe(
      tap(newItem => {
        this.menuItemsSignal.update(list => [...list, newItem]);
      })
    );
  }

  update(id: number, request: UpdateMenuItemRequest): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, request).pipe(
      tap(updated => {
        this.menuItemsSignal.update(list =>
          list.map(i => (i.id === id ? updated : i))
        );
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.menuItemsSignal.update(list => list.filter(i => i.id !== id));
      })
    );
  }

  toggleAvailability(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/toggle-availability`, {}).pipe(
      tap(() => {
        this.menuItemsSignal.update(list =>
          list.map(i => (i.id === id ? { ...i, isAvailable: !i.isAvailable } : i))
        );
      })
    );
  }

  uploadImage(itemId: number, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/${itemId}/upload-image`, formData).pipe(
      tap(response => {
        this.menuItemsSignal.update(list =>
          list.map(i => (i.id === itemId ? { ...i, imageUrl: response.imageUrl } : i))
        );
      })
    );
  }
}