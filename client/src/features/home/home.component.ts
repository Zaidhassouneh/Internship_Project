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
  cities: string[] = [];

  constructor(
    private router: Router,
    private landOfferService: LandOfferService
  ) {}

  ngOnInit() {
    this.loadOffers();
  }

  // Load all offers from the API
  loadOffers() {
    this.loading = true;
    this.landOfferService.getOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        this.filteredOffers = offers;
        this.extractCities();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.loading = false;
      }
    });
  }

  // Extract unique cities from offers for filtering
  extractCities() {
    const citySet = new Set<string>();
    this.offers.forEach(offer => {
      if (offer.location) {
        // Extract city from location (assuming format like "City, Region")
        const city = offer.location.split(',')[0].trim();
        citySet.add(city);
      }
    });
    this.cities = Array.from(citySet).sort();
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
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBjbGFzcz0ic2l6ZS02Ij4KICA8cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Im0yLjI1IDE1Ljc1IDUuMTU5LTUuMTU5YTIuMjUgMi4yNSAwIDAgMSAzLjE4MiAwbDUuMTU5IDUuMTU5bS0xLjUtMS41IDEuNDA5LTEuNDA5YTIuMjUgMi4yNSAwIDAgMSAzLjE4MiAwbDIuOTA5IDIuOTA5bS0xOCAzLjc1aDE2LjVhMS41IDEuNSAwIDAgMCAxLjUtMS41VjZhMS41IDEuNSAwIDAgMC0xLjUtMS41SDMuNzVBMS41IDEuNSAwIDAgMCAyLjI1IDZ2MTJhMS41IDEuNSAwIDAgMCAxLjUgMS41Wm0xMC41LTExLjI1aC4wMDh2LjAwOGgtLjAwOFY4LjI1Wm0uMzc1IDBhLjM3NS4zNzUgMCAxIDEtLjc1IDAgLjM3NS4zNzUgMCAwIDEgLjc1IDBaIiAvPgo8L3N2Zz4=';
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
      // Search term filter
      const matchesSearch = !this.searchTerm || 
        offer.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (offer.description && offer.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        offer.location.toLowerCase().includes(this.searchTerm.toLowerCase());

      // City filter
      const matchesCity = !this.selectedCity || 
        offer.location.toLowerCase().includes(this.selectedCity.toLowerCase());

      // Period filter (rent vs buy)
      const matchesPeriod = !this.selectedPeriod || 
        (this.selectedPeriod === 'rent' && offer.isForRent) ||
        (this.selectedPeriod === 'buy' && !offer.isForRent);

      // Land space filter (basic implementation)
      const matchesLandSpace = !this.landSpaceFilter || 
        (offer.landSize && offer.landSize.toString().includes(this.landSpaceFilter));

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
}
