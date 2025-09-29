import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';
import { EquipmentOfferService } from '../../core/services/equipment-offer.service';
import { FarmerOfferService } from '../../core/services/farmer-offer.service';
import { LandOfferService } from '../../core/services/LandOffer.Service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-other-profile',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './other-profile.component.html',
  styleUrls: ['./other-profile.component.css']
})
export class OtherProfileComponent implements OnInit {
  user: any = null;
  loading = true;

  // Real offers data for other user
  offers: any[] = [];
  loadingOffers = false;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipmentOfferService: EquipmentOfferService,
    private farmerOfferService: FarmerOfferService,
    private landOfferService: LandOfferService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserOffers();
  }

  loadUserProfile() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.error = true;
      this.loading = false;
      return;
    }

    // Get owner information from query parameters
    const queryParams = this.route.snapshot.queryParams;
    
    console.log('Other Profile - Query Parameters:', queryParams);
    console.log('Other Profile - User ID:', userId);
    
    this.user = {
      id: userId,
      displayName: queryParams['name'] || 'Unknown User',
      memberSince: queryParams['memberSince'] || '2023-01-01',
      profileImageUrl: queryParams['profileImage'] || null,
      // Additional fields for display
      email: '',
      phone: '',
      location: '',
      bio: ''
    };
    
    console.log('Other Profile - User Data:', this.user);

    this.loading = false;
  }

  loadUserOffers() {
    this.loadingOffers = true;
    const userId = this.route.snapshot.paramMap.get('id');
    
    if (!userId) {
      this.loadingOffers = false;
      return;
    }

    // Load all types of offers for the profile owner
    Promise.all([
      this.equipmentOfferService.getOffers().toPromise(),
      this.farmerOfferService.getOffers().toPromise(),
      this.landOfferService.getOffers().toPromise()
    ]).then(([equipmentOffers, farmerOffers, landOffers]) => {
      this.offers = [];
      
      console.log('Other Profile - API Response - Equipment Offers:', equipmentOffers);
      console.log('Other Profile - API Response - Farmer Offers:', farmerOffers);
      console.log('Other Profile - API Response - Land Offers:', landOffers);
      
      // Filter and add equipment offers
      if (equipmentOffers) {
        const userEquipmentOffers = equipmentOffers.filter(offer => offer.ownerId === userId);
        console.log('Other Profile - User Equipment Offers:', userEquipmentOffers);
        userEquipmentOffers.forEach(offer => {
          console.log('Other Profile - Equipment Offer Photos:', offer.photos);
          const mainPhoto = offer.photos?.find(p => p.isMain);
          console.log('Other Profile - Main Photo:', mainPhoto);
          const imageUrl = this.constructImageUrl(mainPhoto?.url);
          console.log('Other Profile - Constructed Image URL:', imageUrl);
          
          this.offers.push({
            id: offer.id,
            title: offer.title,
            type: 'equipment',
            image: imageUrl,
            price: `${offer.price} JOD`,
            location: offer.location,
            description: offer.description,
            isAvailable: offer.isAvailable,
            originalOffer: offer
          });
        });
      }
      
      // Filter and add farmer offers
      if (farmerOffers) {
        const userFarmerOffers = farmerOffers.filter(offer => offer.ownerId === userId);
        console.log('Other Profile - User Farmer Offers:', userFarmerOffers);
        userFarmerOffers.forEach(offer => {
          console.log('Other Profile - Farmer Offer Photos:', offer.photos);
          const mainPhoto = offer.photos?.find(p => p.isMain);
          console.log('Other Profile - Main Photo:', mainPhoto);
          const imageUrl = this.constructImageUrl(mainPhoto?.url);
          console.log('Other Profile - Constructed Image URL:', imageUrl);
          
          this.offers.push({
            id: offer.id,
            title: offer.fullName,
            type: 'farmer',
            image: imageUrl,
            price: offer.employmentType === 0 ? 'Part-Time' : 'Full-Time',
            location: offer.currentAddress,
            description: offer.description,
            isAvailable: offer.isAvailable,
            originalOffer: offer
          });
        });
      }
      
      // Filter and add land offers
      if (landOffers) {
        const userLandOffers = landOffers.filter(offer => offer.ownerId === userId);
        console.log('Other Profile - User Land Offers:', userLandOffers);
        userLandOffers.forEach(offer => {
          console.log('Other Profile - Land Offer Photos:', offer.photos);
          const mainPhoto = offer.photos?.find(p => p.isMain);
          console.log('Other Profile - Main Photo:', mainPhoto);
          const imageUrl = this.constructImageUrl(mainPhoto?.url);
          console.log('Other Profile - Constructed Image URL:', imageUrl);
          
          this.offers.push({
            id: offer.id,
            title: offer.title,
            type: 'land',
            image: imageUrl,
            price: offer.isForRent ? `${offer.price} JOD/month` : `${offer.price} JOD`,
            location: offer.location,
            description: offer.description,
            isAvailable: offer.isAvailable,
            originalOffer: offer
          });
        });
      }
      
      this.loadingOffers = false;
    }).catch(error => {
      console.error('Error loading offers:', error);
      this.loadingOffers = false;
    });
  }

  formatMemberSince(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  getOfferTypeIcon(type: string): string {
    switch (type) {
      case 'land': return 'bi-tree';
      case 'equipment': return 'bi-gear';
      case 'farmer': return 'bi-person-badge';
      default: return 'bi-file-earmark';
    }
  }

  constructImageUrl(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) return null;
    
    // If the URL is already complete (starts with http), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If the URL starts with /images/, it's already the correct path
    if (imageUrl.startsWith('/images/')) {
      return `https://localhost:5001${imageUrl}`;
    }
    
    // If the URL starts with /, it's a relative path from the API base
    if (imageUrl.startsWith('/')) {
      return `https://localhost:5001${imageUrl}`;
    }
    
    // Otherwise, assume it's a relative path and prepend the base URL
    return `https://localhost:5001/images/${imageUrl}`;
  }


  onImageError(offer: any, event: any) {
    console.log('Other Profile - Image error for offer:', offer.title, 'Image URL:', offer.image, 'Error:', event);
    offer.image = null;
  }

  onImageLoad(offer: any, event: any) {
    console.log('Other Profile - Image loaded successfully for offer:', offer.title, 'Image URL:', offer.image);
  }

}
