import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { MenuItemService } from '../../../core/services/menu-item.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent {
  readonly authService = inject(AuthService);
  public categoryService = inject(CategoryService);
  public menuItemService = inject(MenuItemService);

  categoriesCount = computed(() => this.categoryService.categories().length);
  itemsCount = computed(() => this.menuItemService.menuItems().length);
  availableCount = computed(() =>
    this.menuItemService.menuItems().filter(i => i.isAvailable).length
  );
  hasNoContentYet = computed(() => this.categoriesCount() === 0);

  ngOnInit() {
    this.categoryService.getAll().subscribe();
    this.menuItemService.getAll().subscribe();
  }
}
