import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  categories = this.categoryService.categories; 

  isModalOpen = signal(false);
  editingCategory = signal<Category | null>(null);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
    sortOrder: [0],
    isActive: [true]
  });

  constructor(
  ) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe();
  }

  openCreateModal() {
    this.editingCategory.set(null);
    this.form.reset({ nameAr: '', nameEn: '', sortOrder: 0, isActive: true });
    this.isModalOpen.set(true);
    console.log('openCreateModal called');
  }

  openEditModal(category: Category) {
    this.editingCategory.set(category);
    this.form.setValue({
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      sortOrder: category.sortOrder,
      isActive: category.isActive
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.errorMessage.set(null);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    const editing = this.editingCategory();

    const request$ = editing
      ? this.categoryService.update(editing.id, this.form.getRawValue())
      : this.categoryService.create(this.form.getRawValue());

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('حدث خطأ أثناء الحفظ، حاول مرة أخرى');
      }
    });
  }

  deleteCategory(category: Category) {
    if (!confirm(`هل تريد حذف "${category.nameAr}"؟`)) return;

    this.categoryService.delete(category.id).subscribe({
      error: () => alert('حدث خطأ أثناء الحذف')
    });
  }
}