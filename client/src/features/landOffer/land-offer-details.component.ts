import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';
import { LandOfferService } from '../../core/services/LandOffer.Service';
import { LandOfferDto } from '../../types/LandOffer';

@Component({
  selector: 'app-land-offer-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './land-offer-details.component.html',
  styleUrls: ['./land-offer-details.component.css']
})
export class LandOfferDetailsComponent implements OnInit {
  offer: LandOfferDto | null = null;
  loading = true;
  currentImageIndex = 0;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private landOfferService: LandOfferService
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

    this.landOfferService.getOfferById(parseInt(offerId)).subscribe({
      next: (offer) => {
        this.offer = offer;
        console.log('=== DETAILS COMPONENT DEBUG ===');
        console.log('Full offer object:', offer);
        console.log('isForRent:', offer.isForRent);
        console.log('leaseDuration:', offer.leaseDuration);
        console.log('leaseDuration type:', typeof offer.leaseDuration);
        console.log('leaseDuration === null:', offer.leaseDuration === null);
        console.log('leaseDuration === undefined:', offer.leaseDuration === undefined);
        console.log('leaseDuration === 0:', offer.leaseDuration === 0);
        console.log('================================');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading offer:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  getCurrentImage(): string {
    if (!this.offer || !this.offer.photos || this.offer.photos.length === 0) {
      return 'https://via.placeholder.com/600x400?text=No+Image+Available';
    }
    return this.getOfferImage(this.offer.photos[this.currentImageIndex]);
  }

  getOfferImage(photo: any): string {
    if (!photo || !photo.url) {
      return 'https://via.placeholder.com/600x400?text=Image+Not+Found';
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

  formatLeaseDuration(months: number | null): string {
    if (months === null || months === undefined) return '';
    if (months === 0) return '0 mos';
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years} yrs ${remainingMonths} mos`;
    } else if (years > 0) {
      return `${years} yrs`;
    } else {
      return `${months} mos`;
    }
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
