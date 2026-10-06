import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './features/dashboard/dashboard-home/dashboard-home.component';
import { authGuard } from './core/guards/auth.guard';
import { CategoriesComponent } from './features/dashboard/categories/categories.component';
import { MenuItemsComponent } from './features/dashboard/menu-items/menu-items.component';
import { QrCodeComponent } from './features/dashboard/qr-code/qr-code.component';
import { PublicMenuComponent } from './features/public-menu/public-menu.component';

export const routes: Routes = [
  {path:'',component:LandingComponent},
  {path:'login',component:LoginComponent},
  {path:'register',component:RegisterComponent},
  { path: 'menu/:slug', component: PublicMenuComponent },
  {
    path:'dashboard',
    component:DashboardLayoutComponent,
    canActivate:[authGuard],
    children:[
      {path:'',component:DashboardHomeComponent},
      {path:'categories',component:CategoriesComponent},
      {path:'menu-items',component:MenuItemsComponent},
      { path: 'qr-code', component: QrCodeComponent },
    ]
  }
];
