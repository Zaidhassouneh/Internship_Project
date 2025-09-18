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
}
