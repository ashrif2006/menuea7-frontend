import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/category`;
     private categoriesSignal = signal<Category[]>([]);
    categories = this.categoriesSignal.asReadonly();
    private loadOnce = false;

    getAll():Observable<Category[]> {
        if(this.loadOnce){
            return new Observable(ob=>{
                ob.next(this.categoriesSignal());   
                ob.complete();
            });
        }

        return this.http.get<Category[]>(this.apiUrl).pipe(
            tap(categories => {
                this.categoriesSignal.set(categories);
                this.loadOnce = true;
            })
        )

    }

    create(request: CreateCategoryRequest) : Observable<Category> {
        return this.http.post<Category>(this.apiUrl, request).pipe(
            tap(newCategory =>{
                this.categoriesSignal.update(categories => [...categories, newCategory]);
            })
        )
    }

    update(id: number, request: UpdateCategoryRequest): Observable<Category> {
        return this.http.put<Category>(`${this.apiUrl}/${id}`, request).pipe(
        tap(updated => {
            this.categoriesSignal.update(list =>
            list.map(c => (c.id === id ? updated : c))
            );
        })
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
        tap(() => {
            this.categoriesSignal.update(list => list.filter(c => c.id !== id));
        })
        );
    }



}