import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';
import { EquipmentOfferService } from '../../core/services/equipment-offer.service';
import { EquipmentOfferDto } from '../../types/EquipmentOffer';

@Component({
  selector: 'app-equipment-offer-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './equipment-offer-details.component.html',
  styleUrls: ['./equipment-offer-details.component.css']
})
export class EquipmentOfferDetailsComponent implements OnInit {
  offer: EquipmentOfferDto | null = null;
  loading = true;
  currentImageIndex = 0;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipmentOfferService: EquipmentOfferService
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

    this.equipmentOfferService.getOfferById(parseInt(offerId)).subscribe({
      next: (offer) => {
        this.offer = offer;
        console.log('=== EQUIPMENT DETAILS COMPONENT DEBUG ===');
        console.log('Full equipment offer object:', offer);
        console.log('Photos array:', offer.photos);
        console.log('Photos length:', offer.photos?.length);
        if (offer.photos && offer.photos.length > 0) {
          console.log('First photo URL:', offer.photos[0].url);
        }
        console.log('=========================================');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading equipment offer:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  getCurrentImage(): string {
    if (this.offer?.photos && this.offer.photos.length > 0) {
      const photoUrl = this.offer.photos[this.currentImageIndex].url;
      let fullUrl = '';
      
      if (photoUrl.startsWith('/images/')) {
        // URL already includes /images/, just add the base URL
        fullUrl = `https://localhost:5001${photoUrl}`;
      } else if (photoUrl.startsWith('/')) {
        // URL starts with / but not /images/, add /images
        fullUrl = `https://localhost:5001/images${photoUrl}`;
      } else {
        fullUrl = photoUrl;
      }
      
      console.log('Equipment Details - Original URL:', photoUrl);
      console.log('Equipment Details - Full URL:', fullUrl);
      return fullUrl;
    }
    return '';
  }

  nextImage() {
    if (this.offer?.photos && this.offer.photos.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.offer.photos.length;
    }
  }

  previousImage() {
    if (this.offer?.photos && this.offer.photos.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.offer.photos.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  onImageError(event: any) {
    console.log('Image load error:', event);
    console.log('Failed image URL:', event.target.src);
    event.target.style.display = 'none';
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  getDeliveryTypeName(type: string): string {
    switch (type) {
      case 'SelfPickup':
        return 'Self Pickup Only';
      case 'DeliveryPaid':
        return 'Delivery Available (Additional Fee)';
      case 'FreeDelivery':
        return 'Free Delivery Included';
      case 'DeliveryOnly':
        return 'Delivery Only (No Pickup)';
      default:
        return type;
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
    // Pass owner information through query parameters
    this.router.navigate(['/profile', ownerId], {
      queryParams: {
        name: this.offer?.ownerName,
        memberSince: this.offer?.ownerMemberSince,
        profileImage: this.offer?.ownerProfileImageUrl
      }
    });
  }

  buyEquipment() {
    if (!this.offer) return;
    
    // TODO: Implement actual purchase logic
    // This could include:
    // 1. Creating a purchase order
    // 2. Redirecting to payment page
    // 3. Sending notification to seller
    // 4. Updating equipment availability
    
    console.log('Equipment purchase initiated:', {
      equipmentId: this.offer.id,
      title: this.offer.title,
      price: this.offer.price,
      sellerId: this.offer.ownerId,
      sellerName: this.offer.ownerName
    });
  }
}
