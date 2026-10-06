import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItemService } from '../../../core/services/menu-item.service';
import { CategoryService } from '../../../core/services/category.service';
import { MenuItem, MenuItemVariant } from '../../../core/models/menu-item.model';

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

  // true = الصنف بأحجام، false = سعر واحد
  useVariants = signal(false);

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
    isAvailable: [true],
    variants: this.fb.array<FormGroup>([])
  });

  constructor(
  ) {}

  get variants() {
    return this.form.controls.variants;
  }

  ngOnInit() {
    this.categoryService.getAll().subscribe();
    this.menuItemService.getAll().subscribe();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category ? category.nameAr : 'غير محدد';
  }

  getDisplayPrice(item: MenuItem): string {
    if (item.variants?.length) {
      const min = Math.min(...item.variants.map(v => v.price));
      return `يبدأ من ${min} ج.م`;
    }
    return item.price != null ? `${item.price} ج.م` : '—';
  }

  // ===== الأحجام =====
  private createVariantGroup(v?: MenuItemVariant): FormGroup {
    return this.fb.nonNullable.group({
      nameAr: [v?.nameAr ?? '', Validators.required],
      nameEn: [v?.nameEn ?? '', Validators.required],
      price: [v?.price ?? 0, [Validators.required, Validators.min(0.01)]],
      sortOrder: [v?.sortOrder ?? this.variants.length]
    });
  }

  setPricingMode(withVariants: boolean) {
    this.useVariants.set(withVariants);

    if (withVariants) {
      this.form.controls.price.disable();
      if (this.variants.length === 0) this.addVariant();
    } else {
      this.form.controls.price.enable();
      this.variants.clear();
    }
  }

  addVariant() {
    this.variants.push(this.createVariantGroup());
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }

  // ===== المودال =====
  openCreateModal() {
    this.editingItem.set(null);
    this.selectedFile = null;
    this.imagePreviewUrl.set(null);
    this.imageWarning.set(null);

    this.variants.clear();
    this.form.controls.price.enable();
    this.useVariants.set(false);

    this.form.patchValue({
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

    this.variants.clear();
    item.variants.forEach(v => this.variants.push(this.createVariantGroup(v)));

    const hasVariants = item.variants.length > 0;
    this.useVariants.set(hasVariants);
    if (hasVariants) this.form.controls.price.disable();
    else this.form.controls.price.enable();

    this.form.patchValue({
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
    const raw = this.form.getRawValue();
    const withVariants = this.useVariants();

    const payload = {
      categoryId: Number(raw.categoryId),
      nameAr: raw.nameAr,
      nameEn: raw.nameEn,
      descriptionAr: raw.descriptionAr,
      descriptionEn: raw.descriptionEn,
      sortOrder: raw.sortOrder,
      isAvailable: raw.isAvailable,
      // سعر واحد أو أحجام، مش الاتنين مع بعض (الـ Backend بيتحقق من كده)
      price: withVariants ? undefined : raw.price,
      variants: withVariants
        ? raw.variants.map((v, i) => ({
            nameAr: v['nameAr'],
            nameEn: v['nameEn'],
            price: v['price'],
            sortOrder: i
          }))
        : []
    };

    const request$ = editing
      ? this.menuItemService.update(editing.id, payload)
      : this.menuItemService.create(payload);

    request$.subscribe({
      next: (savedItem) => {
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
}