import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';
import { FarmerOfferService, FarmerOfferDto } from '../../core/services/farmer-offer.service';

@Component({
  selector: 'app-farmer-offer-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './farmer-offer-details.component.html',
  styleUrls: ['./farmer-offer-details.component.css']
})
export class FarmerOfferDetailsComponent implements OnInit {
  offer: FarmerOfferDto | null = null;
  loading = true;
  currentImageIndex = 0;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private farmerOfferService: FarmerOfferService
  ) {}

  ngOnInit() {
    this.loadOffer();
  }

  loadOffer() {
    const offerId = this.route.snapshot.paramMap.get('id');
    if (!offerId) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.farmerOfferService.getOfferById(parseInt(offerId)).subscribe({
      next: (offer) => {
        this.offer = offer;
        console.log('=== FARMER DETAILS COMPONENT DEBUG ===');
        console.log('Full farmer offer object:', offer);
        console.log('=====================================');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading farmer offer:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  getCurrentImage(): string {
    if (!this.offer || !this.offer.photos || this.offer.photos.length === 0) {
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY2NjY2NiIgY2xhc3M9InNpemUtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPg==';
    }
    return this.getFarmerOfferImage(this.offer.photos[this.currentImageIndex]);
  }

  getFarmerOfferImage(photo: any): string {
    if (!photo || !photo.url) {
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY2NjY2NiIgY2xhc3M9InNpemUtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPg==';
    }
    
    const photoUrl = photo.url;
    if (photoUrl.startsWith('/')) {
      return `https://localhost:5001${photoUrl}`;
    }
    return photoUrl;
  }

  nextImage() {
    if (this.offer && this.offer.photos && this.offer.photos.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.offer.photos.length;
    }
  }

  previousImage() {
    if (this.offer && this.offer.photos && this.offer.photos.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.offer.photos.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
  }

  onImageError(event: any) {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY2NjY2NiIgY2xhc3M9InNpemUtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPg==';
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
