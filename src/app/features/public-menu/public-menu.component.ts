import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicMenuService } from '../../core/services/public-menu.service';
import { PublicMenu, PublicMenuItem } from '../../core/models/public-menu.model';

type Lang = 'ar' | 'en';

@Component({
  selector: 'app-public-menu',
  standalone: true,
  imports: [],
  templateUrl: './public-menu.component.html',
  styleUrl: './public-menu.component.css'
})
export class PublicMenuComponent implements OnInit {
  menu = signal<PublicMenu | null>(null);
  isLoading = signal(true);
  notFound = signal(false);

  lang = signal<Lang>('ar');
  activeCategoryId = signal<number | null>(null);

  isRtl = computed(() => this.lang() === 'ar');

  constructor(
    private route: ActivatedRoute,
    private publicMenuService: PublicMenuService
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    this.publicMenuService.getMenu(slug).subscribe({
      next: (data) => {
        this.menu.set(data);
        this.activeCategoryId.set(data.categories[0]?.id ?? null);
        this.isLoading.set(false);
        console.log('Menu data:', data); // Log the menu data for debugging
      },
      error: () => {
        this.notFound.set(true);
        this.isLoading.set(false);
      }
    });
  }

  toggleLang() {
    this.lang.set(this.lang() === 'ar' ? 'en' : 'ar');
  }

  scrollTo(categoryId: number) {
    this.activeCategoryId.set(categoryId);
    document.getElementById('cat-' + categoryId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  selectCategory(categoryId: number) {
    this.activeCategoryId.set(categoryId);
  }

  name(entity: { nameAr: string; nameEn: string }): string {
    return this.lang() === 'ar' ? entity.nameAr : entity.nameEn;
  }

  description(item: PublicMenuItem): string | null {
    return this.lang() === 'ar' ? item.descriptionAr : item.descriptionEn;
  }

  displayPrice(item: PublicMenuItem): string {
    const unit = this.lang() === 'ar' ? 'ج.م' : 'EGP';
    if (item.variants.length) {
      const min = Math.min(...item.variants.map(v => v.price));
      return this.lang() === 'ar' ? `يبدأ من ${min} ${unit}` : `From ${min} ${unit}`;
    }
    return item.price != null ? `${item.price} ${unit}` : '';
  }
}