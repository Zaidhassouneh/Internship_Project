import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';
import { SlideshowComponent } from '../slideshow-component/slideshow-component';
import { LandOfferService } from '../../core/services/LandOffer.Service';
import { LandOfferDto } from '../../types/LandOffer';
import { FarmerOfferService, FarmerOfferDto } from '../../core/services/farmer-offer.service';
import { EquipmentOfferService } from '../../core/services/equipment-offer.service';
import { EquipmentOfferDto, DeliveryType } from '../../types/EquipmentOffer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, SlideshowComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  offers: LandOfferDto[] = [];
  farmerOffers: FarmerOfferDto[] = [];
  equipmentOffers: EquipmentOfferDto[] = [];
  allOffers: any[] = [];
  filteredOffers: any[] = [];
  loading = false;
  
  // Search and filter properties
  searchTerm = '';
  selectedCity = '';
  selectedPeriod = '';
  landSpaceFilter = '';
  selectedCondition = '';
  selectedDeliveryType = '';
  filtersApplied = false;
  
  // Available cities for filtering
  cities: string[] = [
    'Amman',
    'Irbid', 
    'Zarqa',
    'Mafraq',
    'Jerash',
    'Ajloun',
    'Salt',
    'Madaba',
    'Karak',
    'Tafilah',
    'Aqaba'
  ];

  constructor(
    private router: Router,
    private landOfferService: LandOfferService,
    private farmerOfferService: FarmerOfferService,
    private equipmentOfferService: EquipmentOfferService
  ) {}

  ngOnInit() {
    this.initializeCities();
    this.loadOffers();
    this.loadFarmerOffers();
    this.loadEquipmentOffers();
  }

  // Load all offers from the API
  loadOffers() {
    this.loading = true;
    this.landOfferService.getOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        this.createUnifiedOffersList();
        this.initializeCities();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.loading = false;
      }
    });
  }

  // Load all farmer offers from the API
  loadFarmerOffers() {
    this.farmerOfferService.getOffers(true).subscribe({
      next: (farmerOffers) => {
        this.farmerOffers = farmerOffers;
        this.createUnifiedOffersList();
      },
      error: (error) => {
        console.error('Error loading farmer offers:', error);
      }
    });
  }

  // Load all equipment offers from the API
  loadEquipmentOffers() {
    this.equipmentOfferService.getOffers(true).subscribe({
      next: (equipmentOffers) => {
        this.equipmentOffers = equipmentOffers;
        this.createUnifiedOffersList();
      },
      error: (error) => {
        console.error('Error loading equipment offers:', error);
      }
    });
  }

  // Create unified offers list with land, farmer, and equipment offers, sorted by date
  createUnifiedOffersList() {
    this.allOffers = [];
    
    // Add land offers with type identifier
    this.offers.forEach(offer => {
      this.allOffers.push({
        ...offer,
        type: 'land',
        publishedDate: new Date(offer.createdAt || new Date())
      });
    });
    
    // Add farmer offers with type identifier
    this.farmerOffers.forEach(offer => {
      this.allOffers.push({
        ...offer,
        type: 'farmer',
        publishedDate: new Date(offer.updatedAt || offer.createdAt || new Date())
      });
    });
    
    // Add equipment offers with type identifier
    this.equipmentOffers.forEach(offer => {
      this.allOffers.push({
        ...offer,
        type: 'equipment',
        publishedDate: new Date(offer.createdAt || new Date())
      });
    });
    
    // Sort by publication date (newest first)
    this.allOffers.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
    
    // Initially show all offers (default behavior)
    this.filteredOffers = [...this.allOffers];
    this.filtersApplied = false;
  }

  // Show all offers without any filtering
  showAllOffers() {
    this.filteredOffers = [...this.allOffers];
    this.filtersApplied = false;
  }

  // Initialize cities for filtering
  initializeCities() {
    // Cities are already defined in the cities array
    // No need to extract from offers
  }

  // Scroll to offers section when "Rent Land" is clicked
  scrollToOffers() {
    const offersSection = document.getElementById('offers');
    if (offersSection) {
      offersSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Navigate to land offer creation page
  navigateToOfferLand() {
    this.router.navigate(['/landOffer']);
  }

  // Navigate to farmer offer creation page
  navigateToFarmerOffer() {
    this.router.navigate(['/farmerOffer']);
  }

  navigateToEquipmentOffer() {
    this.router.navigate(['/equipmentOffer']);
  }

  // Navigate to land offer details page
  navigateToOfferDetails(offerId: number) {
    this.router.navigate(['/landOffer', offerId]);
  }

  // Navigate to farmer offer details page
  navigateToFarmerOfferDetails(offerId: number) {
    this.router.navigate(['/farmerOffer', offerId]);
  }

  // Navigate to equipment offer details page
  navigateToEquipmentOfferDetails(offerId: number) {
    this.router.navigate(['/equipmentOffer', offerId]);
  }

  // Navigate to offer details based on type
  navigateToOffer(offer: any) {
    if (offer.type === 'land') {
      this.navigateToOfferDetails(offer.id);
    } else if (offer.type === 'farmer') {
      this.navigateToFarmerOfferDetails(offer.id);
    } else if (offer.type === 'equipment') {
      this.navigateToEquipmentOfferDetails(offer.id);
    }
  }

  // Get the appropriate image for an offer
  getOfferImage(offer: LandOfferDto): string {
    if (offer.photos && offer.photos.length > 0) {
      // If the photo URL is relative, make it absolute
      const photoUrl = offer.photos[0].url;
      if (photoUrl.startsWith('/')) {
        // Assuming your API serves images from the same domain
        return `https://localhost:5001${photoUrl}`;
      }
      return photoUrl;
    }
    // Return an icon image instead of placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0ic2l6ZS02Ij4KICA8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xLjUgNmEyLjI1IDIuMjUgMCAwIDEgMi4yNS0yLjI1aDE2LjVBMi4yNSAyLjI1IDAgMCAxIDIyLjUgNnYxMmEyLjI1IDIuMjUgMCAwIDEtMi4yNSAyLjI1SDMuNzVBMi4yNSAyLjI1IDAgMCAxIDEuNSAxOFY2Wk0zIDE2LjA2VjE4YzAgLjQxNC4zMzYuNzUuNzUuNzVoMTYuNUEuNzUuNzUgMCAwIDAgMjEgMTh2LTEuOTRsLTIuNjktMi42ODlhMS41IDEuNSAwIDAgMC0yLjEyIDBsLS44OC44NzkuOTcuOTdhLjc1Ljc1IDAgMSAxLTEuMDYgMS4wNmwtNS4xNi01LjE1OWExLjUgMS41IDAgMCAwLTIuMTIgMEwzIDE2LjA2MVptMTAuMTI1LTcuODFhMS4xMjUgMS4xMjUgMCAxIDEgMi4yNSAwIDEuMTI1IDEuMTI1IDAgMCAxLTIuMjUgMFoiIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz4KPC9zdmc+';
  }

  // Get the appropriate image for a farmer offer
  getFarmerOfferImage(offer: FarmerOfferDto): string {
    if (offer.photos && offer.photos.length > 0) {
      // If the photo URL is relative, make it absolute
      const photoUrl = offer.photos[0].url;
      if (photoUrl.startsWith('/')) {
        // Assuming your API serves images from the same domain
        return `https://localhost:5001${photoUrl}`;
      }
      return photoUrl;
    }
    // Return a user profile icon instead of placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY2NjY2NiIgY2xhc3M9InNpemUtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPg==';
  }

  // Get the appropriate image for an equipment offer
  getEquipmentOfferImage(offer: EquipmentOfferDto): string {
    if (offer.photos && offer.photos.length > 0) {
      // If the photo URL is relative, make it absolute
      const photoUrl = offer.photos[0].url;
      if (photoUrl.startsWith('/')) {
        // Assuming your API serves images from the same domain
        return `https://localhost:5001${photoUrl}`;
      }
      return photoUrl;
    }
    // Return an equipment icon instead of placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY2NjY2NiIgY2xhc3M9InNpemUtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTEgMTVoLTJ2LTJoMnYyem0wLTQtSDl2LTJoNHYyem0wLTZIN1Y3aDR2MnptNiAxMGgtMnYtMmgydjJ6bTAtNGgtMnYtMmg0djJ6bTAtNkgxM1Y3aDR2MnoiIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz4KPC9zdmc+';
  }

  // Get the appropriate image for any offer type
  getUnifiedOfferImage(offer: any): string {
    if (offer.type === 'land') {
      return this.getOfferImage(offer);
    } else if (offer.type === 'farmer') {
      return this.getFarmerOfferImage(offer);
    } else if (offer.type === 'equipment') {
      return this.getEquipmentOfferImage(offer);
    }
    return '';
  }

  // Handle image loading errors
  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/400x250?text=Image+Not+Found';
  }

  // Search offers by title or description
  searchOffers() {
    this.applyFilters();
  }

  // Handle period filter change
  onPeriodFilterChange() {
    // Clear land space filter when switching to "Hire a Farmer" or "All"
    if (this.selectedPeriod === 'hire' || !this.selectedPeriod || this.selectedPeriod === '') {
      this.landSpaceFilter = '';
    }
  }



  // Apply all filters
  applyFilters() {
    this.filtersApplied = true;
    
    this.filteredOffers = this.allOffers.filter(offer => {
      // Search term filter - case-insensitive partial matching
      let matchesSearch = false;
      if (offer.type === 'land') {
        matchesSearch = !this.searchTerm || 
          offer.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (offer.description && offer.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          offer.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      } else if (offer.type === 'farmer') {
        matchesSearch = !this.searchTerm || 
          offer.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (offer.description && offer.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          offer.currentAddress.toLowerCase().includes(this.searchTerm.toLowerCase());
      } else if (offer.type === 'equipment') {
        matchesSearch = !this.searchTerm || 
          offer.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (offer.description && offer.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          offer.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      }

      // City filter - case-insensitive partial matching
      let matchesCity = false;
      if (offer.type === 'land') {
        matchesCity = !this.selectedCity || 
          offer.location.toLowerCase().includes(this.selectedCity.toLowerCase());
      } else if (offer.type === 'farmer') {
        matchesCity = !this.selectedCity || 
          offer.currentAddress.toLowerCase().includes(this.selectedCity.toLowerCase());
      } else if (offer.type === 'equipment') {
        matchesCity = !this.selectedCity || 
          offer.location.toLowerCase().includes(this.selectedCity.toLowerCase());
      }

      // Period filter
      let matchesPeriod = false;
      if (!this.selectedPeriod || this.selectedPeriod === '') {
        matchesPeriod = true; // Show all when no filter selected or "All" is selected
      } else if (this.selectedPeriod === 'rent') {
        matchesPeriod = offer.type === 'land' && offer.isForRent;
      } else if (this.selectedPeriod === 'buy') {
        matchesPeriod = offer.type === 'land' && !offer.isForRent;
      } else if (this.selectedPeriod === 'hire') {
        matchesPeriod = offer.type === 'farmer';
      } else if (this.selectedPeriod === 'equipment') {
        matchesPeriod = offer.type === 'equipment';
      }

      // Land space filter (only for land offers and when rent/buy is selected)
      let matchesLandSpace = true;
      if (offer.type === 'land' && this.landSpaceFilter && (this.selectedPeriod === 'rent' || this.selectedPeriod === 'buy')) {
        matchesLandSpace = offer.landSize && this.matchesLandSizeRange(offer.landSize, this.landSpaceFilter);
      }

      // Equipment condition filter
      let matchesCondition = true;
      if (offer.type === 'equipment' && this.selectedCondition) {
        matchesCondition = offer.condition === this.selectedCondition;
      }

      // Equipment delivery type filter
      let matchesDeliveryType = true;
      if (offer.type === 'equipment' && this.selectedDeliveryType) {
        matchesDeliveryType = offer.deliveryType === this.selectedDeliveryType;
      }

      return matchesSearch && matchesCity && matchesPeriod && matchesLandSpace && matchesCondition && matchesDeliveryType;
    });
  }

  // Clear all filters
  clearFilters() {
    this.searchTerm = '';
    this.selectedCity = '';
    this.selectedPeriod = '';
    this.landSpaceFilter = '';
    this.selectedCondition = '';
    this.selectedDeliveryType = '';
    this.showAllOffers();
  }

  // Get delivery type display name
  getDeliveryTypeName(type: DeliveryType): string {
    switch (type) {
      case DeliveryType.SelfPickup:
        return 'Self Pickup Only';
      case DeliveryType.DeliveryPaid:
        return 'Delivery Available (Additional Fee)';
      case DeliveryType.FreeDelivery:
        return 'Free Delivery Included';
      case DeliveryType.DeliveryOnly:
        return 'Delivery Only (No Pickup)';
      default:
        return 'Unknown';
    }
  }

  // Check if land size matches the filter range
  private matchesLandSizeRange(landSize: number, filterValue: string): boolean {
    // Remove any non-numeric characters except decimal points
    const cleanFilter = filterValue.replace(/[^\d.]/g, '');
    
    if (!cleanFilter) return true;
    
    const filterNumber = parseFloat(cleanFilter);
    if (isNaN(filterNumber)) return true;
    
    // Calculate the range: filter value ± 10% of the filter value
    const range = filterNumber * 0.1; // 10% range
    const minRange = filterNumber - range;
    const maxRange = filterNumber + range;
    
    // Check if the land size falls within the range
    return landSize >= minRange && landSize <= maxRange;
  }

}
