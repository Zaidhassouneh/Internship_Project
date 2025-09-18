import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum EmploymentType {
  PartTime = 0,    // "Part-Time"
  FullTime = 1     // "Full-Time"
}

export interface FarmerOfferDto {
  id: number;
  ownerId: string;
  fullName: string;
  contactNumber: string;
  currentAddress: string;
  description: string;
  employmentType: EmploymentType;
  age?: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
  photos: FarmerOfferPhotoDto[];
}

export interface FarmerOfferPhotoDto {
  id: number;
  url: string;
  isMain: boolean;
}

export interface FarmerOfferCreateDto {
  ownerId: string;
  fullName: string;
  contactNumber: string;
  currentAddress: string;
  description: string;
  employmentType: EmploymentType;
  age?: number;
}

export interface FarmerOfferUpdateDto {
  fullName?: string;
  contactNumber?: string;
  currentAddress?: string;
  description?: string;
  employmentType?: EmploymentType;
  age?: number;
  isAvailable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FarmerOfferService {
  private base = `${environment.apiBaseUrl}/farmeroffers`;

  constructor(private http: HttpClient) {}

  getOffers(available?: boolean, page: number = 1, pageSize: number = 20): Observable<FarmerOfferDto[]> {
    let url = `${this.base}?page=${page}&pageSize=${pageSize}`;
    if (available !== undefined) {
      url += `&available=${available}`;
    }
    return this.http.get<FarmerOfferDto[]>(url);
  }

  getOfferById(id: number): Observable<FarmerOfferDto> {
    return this.http.get<FarmerOfferDto>(`${this.base}/${id}`);
  }

  createFarmerOffer(dto: FarmerOfferCreateDto): Observable<FarmerOfferDto> {
    return this.http.post<FarmerOfferDto>(this.base, dto);
  }

  updateFarmerOffer(id: number, dto: FarmerOfferUpdateDto): Observable<FarmerOfferDto> {
    return this.http.put<FarmerOfferDto>(`${this.base}/${id}`, dto);
  }

  deleteFarmerOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadPhoto(offerId: number, file: File): Observable<FarmerOfferPhotoDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FarmerOfferPhotoDto>(`${this.base}/${offerId}/photos`, formData);
  }

  setMainPhoto(offerId: number, photoId: number): Observable<FarmerOfferDto> {
    return this.http.put<FarmerOfferDto>(`${this.base}/${offerId}/photos/${photoId}/main`, {});
  }

  deletePhoto(offerId: number, photoId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${offerId}/photos/${photoId}`);
  }
}
