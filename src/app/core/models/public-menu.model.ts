export interface PublicMenuItemVariant {
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface PublicMenuItem {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  price: number | null;
  variants: PublicMenuItemVariant[];
}

export interface PublicCategory {
  id: number;
  nameAr: string;
  nameEn: string;
  items: PublicMenuItem[];
}

export interface PublicMenu {
  cafeName: string;
  logoUrl: string | null;
  categories: PublicCategory[];
}