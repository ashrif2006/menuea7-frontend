import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MenuItemService } from '../../../core/services/menu-item.service';
import { CategoryService } from '../../../core/services/category.service';
import { MenuItem } from '../../../core/models/menu-item.model';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './menu-items.component.html',
  styleUrl: './menu-items.component.css'
})
export class MenuItemsComponent implements OnInit {
  private menuItemService = inject(MenuItemService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  menuItems = this.menuItemService.menuItems;
  categories = this.categoryService.categories;

  isModalOpen = signal(false);
  editingItem = signal<MenuItem | null>(null);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  imageWarning = signal<string | null>(null);

  selectedFile: File | null = null;
  imagePreviewUrl = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    categoryId: [0, Validators.required],
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
    descriptionAr: [''],
    descriptionEn: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    sortOrder: [0],
    isAvailable: [true]
  });

  constructor(
  ) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe();
    this.menuItemService.getAll().subscribe();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category ? category.nameAr : 'غير محدد';
  }

  openCreateModal() {
    this.editingItem.set(null);
    this.selectedFile = null;
    this.imagePreviewUrl.set(null);
    this.imageWarning.set(null);
    this.form.reset({
      categoryId: this.categories()[0]?.id ?? 0,
      nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '',
      price: 0, sortOrder: 0, isAvailable: true
    });
    this.isModalOpen.set(true);
  }

  openEditModal(item: MenuItem) {
    this.editingItem.set(item);
    this.selectedFile = null;
    this.imagePreviewUrl.set(item.imageUrl);
    this.imageWarning.set(null);
    this.form.setValue({
      categoryId: item.categoryId,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      descriptionAr: item.descriptionAr ?? '',
      descriptionEn: item.descriptionEn ?? '',
      price: item.price ?? 0,
      sortOrder: item.sortOrder,
      isAvailable: item.isAvailable
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.errorMessage.set(null);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.imagePreviewUrl.set(URL.createObjectURL(this.selectedFile));
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.imageWarning.set(null);
    const editing = this.editingItem();
    const formValue = this.form.getRawValue();

    const request$ = editing
      ? this.menuItemService.update(editing.id, formValue)
      : this.menuItemService.create(formValue);

    request$.subscribe({
      next: (savedItem) => {
        // الصنف اتحفظ بنجاح. دلوقتي لو فيه صورة مختارة، نحاول نرفعها
        if (this.selectedFile) {
          this.uploadImageThenClose(savedItem.id);
        } else {
          this.isSaving.set(false);
          this.closeModal();
        }
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('حدث خطأ أثناء حفظ الصنف، حاول مرة أخرى');
      }
    });
  }

  private uploadImageThenClose(itemId: number) {
    this.menuItemService.uploadImage(itemId, this.selectedFile!).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => {
        // الصنف اتحفظ بنجاح، بس الصورة فشلت. منمنعش المستخدم، بس نوريه تحذير
        this.isSaving.set(false);
        this.imageWarning.set('تم حفظ الصنف، لكن حدث خطأ أثناء رفع الصورة. يمكنك المحاولة مرة أخرى لاحقًا.');
        setTimeout(() => this.closeModal(), 2500);
      }
    });
  }

  deleteItem(item: MenuItem) {
    if (!confirm(`هل تريد حذف "${item.nameAr}"؟`)) return;

    this.menuItemService.delete(item.id).subscribe({
      error: () => alert('حدث خطأ أثناء الحذف')
    });
  }

  toggleAvailability(item: MenuItem) {
    this.menuItemService.toggleAvailability(item.id).subscribe({
      error: () => alert('حدث خطأ أثناء تغيير حالة التوفر')
    });
  }
  getDisplayPrice(item: MenuItem): string {
  if (item.variants?.length) {
    const min = Math.min(...item.variants.map(v => v.price));
    return `يبدأ من ${min} ج.م`;
  }
  return item.price != null ? `${item.price} ج.م` : '—';
}
}