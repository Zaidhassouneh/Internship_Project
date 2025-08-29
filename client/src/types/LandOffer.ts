export interface PhotoDto { id: number; url: string; isMain: boolean; }
export interface LandOfferCreateDto {
ownerId: string;
title: string;
description?: string;
location: string;
price: number;
isForRent: boolean;
landSize?: number;
leaseDuration?: number | null; 
}
export interface LandOfferDto {
id: number;
ownerId: string;
title: string;
description?: string;
location: string;
price: number;
isForRent: boolean;
landSize?: number;
leaseDuration?: number | null;
isAvailable: boolean;
createdAt: string;
photos: PhotoDto[];
}