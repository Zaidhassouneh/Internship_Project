import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LandOfferDto, LandOfferCreateDto, PhotoDto } from '../../types/LandOffer';


@Injectable({ providedIn: 'root' })
export class LandOfferService {
private base = environment.apiBaseUrl;
constructor(private http: HttpClient) {}


createOffer(dto: LandOfferCreateDto) {
return this.http.post<LandOfferDto>(`${this.base}/landoffers`, dto);
}


getOffers(): Observable<LandOfferDto[]> {
return this.http.get<LandOfferDto[]>(`${this.base}/landoffers`);
}

getOfferById(id: number): Observable<LandOfferDto> {
return this.http.get<LandOfferDto>(`${this.base}/landoffers/${id}`);
}


uploadPhoto(offerId: number, file: File) {
const fd = new FormData();
fd.append('file', file);
return this.http.post<PhotoDto>(`${this.base}/landoffers/${offerId}/photos`, fd);
}


setMainPhoto(offerId: number, photoId: number) {
return this.http.put(`${this.base}/landoffers/${offerId}/photos/${photoId}/main`, {});
}


deletePhoto(offerId: number, photoId: number) {
return this.http.delete(`${this.base}/landoffers/${offerId}/photos/${photoId}`);
}
}