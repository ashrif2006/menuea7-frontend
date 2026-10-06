import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicMenuService } from '../../core/services/public-menu.service';
import { PublicMenu, PublicMenuItem } from '../../core/models/public-menu.model';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-public-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-menu.component.html',
  styleUrls: ['./public-menu.component.css']
})
export class PublicMenuComponent implements OnInit {
  private menuService = inject(PublicMenuService);
  private route = inject(ActivatedRoute);

  // States
  isLoading = signal<boolean>(true);
  notFound = signal<boolean>(false);
  menu = signal<PublicMenu | null>(null);
  
  lang = signal<'ar' | 'en'>('en');
  activeCategoryId = signal<number | null>(null);
  searchQuery = signal<string>('');

  // Computed Values
  isRtl = computed(() => this.lang() === 'ar');

  ngOnInit() {
    // استدعاء الـ API كمثال للـ Slug
    const slug = this.route.snapshot.paramMap.get('slug')!;

    this.menuService.getMenu(slug).subscribe({
      next: (data) => {
        this.menu.set(data);
        if (data.categories?.length > 0) {
          this.activeCategoryId.set(data.categories[0].id);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.isLoading.set(false);
      }
    });
  
  }

  toggleLang() {
    this.lang.update(l => l === 'ar' ? 'en' : 'ar');
  }

  selectCategory(id: number) {
    this.activeCategoryId.set(id);
  }

  // Helpers للغة
  name(entity: { nameAr: string; nameEn: string }): string {
    return this.lang() === 'ar' ? entity.nameAr : entity.nameEn;
  }

  description(item: PublicMenuItem): string | null {
    return this.lang() === 'ar' ? item.descriptionAr : item.descriptionEn;
  }
}