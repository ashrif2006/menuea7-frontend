export interface Category {
  id: number;
  sortOrder: number;
  isActive: boolean;
  nameAr: string;
  nameEn: string;
}

export interface CreateCategoryRequest {
  sortOrder: number;
  nameAr: string;
  nameEn: string;
}

export interface UpdateCategoryRequest {
  sortOrder: number;
  isActive: boolean;
  nameAr: string;
  nameEn: string;
}