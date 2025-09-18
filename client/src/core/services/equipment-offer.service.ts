import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  EquipmentOfferDto, 
  EquipmentOfferCreateDto, 
  EquipmentOfferUpdateDto, 
  EquipmentOfferPhotoDto 
} from '../../types/EquipmentOffer';

@Injectable({
  providedIn: 'root'
})
export class EquipmentOfferService {
  private apiUrl = `${environment.apiBaseUrl}/equipmentoffers`;

  constructor(private http: HttpClient) {}

  // Get all equipment offers with optional filtering
  getOffers(available?: boolean, page: number = 1, pageSize: number = 20): Observable<EquipmentOfferDto[]> {
    let url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    if (available !== undefined) {
      url += `&available=${available}`;
    }
    return this.http.get<EquipmentOfferDto[]>(url);
  }

  // Get single equipment offer by ID
  getOffer(id: number): Observable<EquipmentOfferDto> {
    return this.http.get<EquipmentOfferDto>(`${this.apiUrl}/${id}`);
  }

  // Get single equipment offer by ID (alias for consistency)
  getOfferById(id: number): Observable<EquipmentOfferDto> {
    return this.getOffer(id);
  }

  // Create new equipment offer
  createOffer(offer: EquipmentOfferCreateDto): Observable<EquipmentOfferDto> {
    return this.http.post<EquipmentOfferDto>(this.apiUrl, offer);
  }

  // Update equipment offer
  updateOffer(id: number, offer: EquipmentOfferUpdateDto): Observable<EquipmentOfferDto> {
    return this.http.put<EquipmentOfferDto>(`${this.apiUrl}/${id}`, offer);
  }

  // Delete equipment offer
  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Upload photo to equipment offer
  uploadPhoto(offerId: number, file: File): Observable<EquipmentOfferPhotoDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<EquipmentOfferPhotoDto>(`${this.apiUrl}/${offerId}/photos`, formData);
  }

  // Set main photo
  setMainPhoto(offerId: number, photoId: number): Observable<EquipmentOfferDto> {
    return this.http.put<EquipmentOfferDto>(`${this.apiUrl}/${offerId}/photos/${photoId}/main`, {});
  }

  // Delete photo
  deletePhoto(offerId: number, photoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${offerId}/photos/${photoId}`);
  }
}
