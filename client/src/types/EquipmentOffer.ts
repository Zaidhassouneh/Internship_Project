export interface EquipmentOfferCreateDto {
  ownerId: string;
  title: string;
  description?: string;
  price: number;
  location: string;
}

export interface EquipmentOfferUpdateDto {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  isAvailable?: boolean;
}

export interface EquipmentOfferPhotoDto {
  id: number;
  url: string;
  isMain: boolean;
}

export interface EquipmentOfferDto {
  id: number;
  ownerId: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
  photos: EquipmentOfferPhotoDto[];
}
