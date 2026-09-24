export interface MenuItemVariant {
  id: number;
  sortOrder: number;
  price: number;
  isAvailable: boolean;
  nameAr: string;
  nameEn: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  sortOrder: number;
  isAvailable: boolean;
  imageUrl: string | null;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: number | null;
  variants: MenuItemVariant[];
}

export interface CreateMenuItemRequest {
  categoryId: number;
  sortOrder: number;
  imageUrl?: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price?: number;
}

export interface UpdateMenuItemRequest {
  categoryId: number;
  sortOrder: number;
  isAvailable: boolean;
  imageUrl?: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price?: number;
}