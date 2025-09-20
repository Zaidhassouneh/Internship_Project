import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';
import { FarmerOfferService, FarmerOfferDto, EmploymentType } from '../../core/services/farmer-offer.service';

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

  getEmploymentTypeName(type: EmploymentType | string | number): string {
    console.log('Employment type received:', type, 'Type:', typeof type);
    
    // Handle string values from API
    if (typeof type === 'string') {
      switch (type.toLowerCase()) {
        case 'parttime':
        case 'part-time':
          return 'Part-Time';
        case 'fulltime':
        case 'full-time':
          return 'Full-Time';
        default:
          console.log('Unknown employment type string:', type);
          return 'Unknown';
      }
    }
    
    // Handle numeric enum values
    const numericValue = typeof type === 'number' ? type : (type as any);
    switch (numericValue) {
      case EmploymentType.PartTime:
      case 0:
        return 'Part-Time';
      case EmploymentType.FullTime:
      case 1:
        return 'Full-Time';
      default:
        console.log('Unknown employment type:', type);
        return 'Unknown';
    }
  }

  // Format date for display
  formatDate(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  }

  // Format date for detailed display (full date)
  formatDetailedDate(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatMemberSince(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  goToOwnerProfile(ownerId: string) {
    // TODO: Navigate to owner profile page
    console.log('Navigate to owner profile:', ownerId);
  }
}
