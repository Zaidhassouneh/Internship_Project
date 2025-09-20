export enum DeliveryType {
  SelfPickup = 'SelfPickup',
  DeliveryPaid = 'DeliveryPaid',
  FreeDelivery = 'FreeDelivery',
  DeliveryOnly = 'DeliveryOnly'
}

export interface EquipmentOfferCreateDto {
  ownerId: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  condition: string;
  deliveryType: DeliveryType;
  contactNumber?: string;
}

export interface EquipmentOfferUpdateDto {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  condition?: string;
  deliveryType?: DeliveryType;
  contactNumber?: string;
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
  ownerName: string;
  ownerProfileImageUrl?: string;
  ownerMemberSince: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  condition: string;
  deliveryType: DeliveryType;
  contactNumber?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
  photos: EquipmentOfferPhotoDto[];
}
