import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';
import { SlideshowComponent } from '../slideshow-component/slideshow-component';
import { LandOfferService } from '../../core/services/LandOffer.Service';
import { LandOfferDto } from '../../types/LandOffer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, SlideshowComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  offers: LandOfferDto[] = [];
  filteredOffers: LandOfferDto[] = [];
  loading = false;
  
  // Search and filter properties
  searchTerm = '';
  selectedCity = '';
  selectedPeriod = '';
  landSpaceFilter = '';
  
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
    private landOfferService: LandOfferService
  ) {}

  ngOnInit() {
    this.initializeCities();
    this.loadOffers();
  }

  // Load all offers from the API
  loadOffers() {
    this.loading = true;
    this.landOfferService.getOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        this.filteredOffers = offers;
        this.initializeCities();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.loading = false;
      }
    });
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

  // Navigate to land offer details page
  navigateToOfferDetails(offerId: number) {
    this.router.navigate(['/landOffer', offerId]);
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

  // Handle image loading errors
  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/400x250?text=Image+Not+Found';
  }

  // Search offers by title or description
  searchOffers() {
    this.applyFilters();
  }



  // Apply all filters
  applyFilters() {
    this.filteredOffers = this.offers.filter(offer => {
      // Search term filter - case-insensitive partial matching
      const matchesSearch = !this.searchTerm || 
        offer.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (offer.description && offer.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        offer.location.toLowerCase().includes(this.searchTerm.toLowerCase());

      // City filter - case-insensitive partial matching
      const matchesCity = !this.selectedCity || 
        offer.location.toLowerCase().includes(this.selectedCity.toLowerCase());

      // Period filter (rent vs buy)
      const matchesPeriod = !this.selectedPeriod || 
        (this.selectedPeriod === 'rent' && offer.isForRent) ||
        (this.selectedPeriod === 'buy' && !offer.isForRent);

      // Land space filter (range-based implementation)
      const matchesLandSpace = !this.landSpaceFilter || 
        (offer.landSize && this.matchesLandSizeRange(offer.landSize, this.landSpaceFilter));

      return matchesSearch && matchesCity && matchesPeriod && matchesLandSpace;
    });
  }

  // Clear all filters
  clearFilters() {
    this.searchTerm = '';
    this.selectedCity = '';
    this.selectedPeriod = '';
    this.landSpaceFilter = '';
    this.filteredOffers = this.offers;
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
