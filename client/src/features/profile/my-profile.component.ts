import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { EquipmentOfferService } from '../../core/services/equipment-offer.service';
import { FarmerOfferService } from '../../core/services/farmer-offer.service';
import { LandOfferService } from '../../core/services/LandOffer.Service';
import { EquipmentOfferDto } from '../../types/EquipmentOffer';
import { FarmerOfferDto } from '../../core/services/farmer-offer.service';
import { LandOfferDto } from '../../types/LandOffer';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  editingProfile = false;

  // Profile form data
  profileForm = {
    displayName: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  };

  // Real offers data
  offers: any[] = [];
  loadingOffers = false;

  constructor(
    private authService: AuthService,
    private equipmentOfferService: EquipmentOfferService,
    private farmerOfferService: FarmerOfferService,
    private landOfferService: LandOfferService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserOffers();
  }

  loadUserProfile() {
    // Get user data from localStorage and mock additional data
    this.user = {
      id: this.authService.getUserId(),
      displayName: localStorage.getItem('displayName') || 'User',
      email: 'zaid.hassouneh@example.com', // Mock email
      phone: '+962 79 955 421',
      location: 'Amman, Jordan',
      bio: 'Passionate farmer with experience in agricultural equipment.',
      memberSince: '2025-05-18', // Mock date
      profileImageUrl: null
    };

    this.profileForm = {
      displayName: this.user.displayName,
      email: this.user.email,
      phone: this.user.phone,
      location: this.user.location,
      bio: this.user.bio
    };

    this.loading = false;
  }

  loadUserOffers() {
    this.loadingOffers = true;
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.loadingOffers = false;
      return;
    }

    // Load all types of offers for the current user
    Promise.all([
      this.equipmentOfferService.getOffers().toPromise(),
      this.farmerOfferService.getOffers().toPromise(),
      this.landOfferService.getOffers().toPromise()
    ]).then(([equipmentOffers, farmerOffers, landOffers]) => {
      this.offers = [];
      
      console.log('API Response - Equipment Offers:', equipmentOffers);
      console.log('API Response - Farmer Offers:', farmerOffers);
      console.log('API Response - Land Offers:', landOffers);
      
      // Filter and add equipment offers
      if (equipmentOffers) {
        const userEquipmentOffers = equipmentOffers.filter(offer => offer.ownerId === userId);
        console.log('User Equipment Offers:', userEquipmentOffers);
        userEquipmentOffers.forEach(offer => {
          console.log('Equipment Offer Photos:', offer.photos);
          const mainPhoto = offer.photos?.find(p => p.isMain);
          console.log('Main Photo:', mainPhoto);
          const imageUrl = this.constructImageUrl(mainPhoto?.url);
          console.log('Constructed Image URL:', imageUrl);
          
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
        console.log('User Farmer Offers:', userFarmerOffers);
        userFarmerOffers.forEach(offer => {
          console.log('Farmer Offer Photos:', offer.photos);
          const mainPhoto = offer.photos?.find(p => p.isMain);
          console.log('Main Photo:', mainPhoto);
          const imageUrl = this.constructImageUrl(mainPhoto?.url);
          console.log('Constructed Image URL:', imageUrl);
          
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
        console.log('User Land Offers:', userLandOffers);
        userLandOffers.forEach(offer => {
          console.log('Land Offer Photos:', offer.photos);
          const mainPhoto = offer.photos?.find(p => p.isMain);
          console.log('Main Photo:', mainPhoto);
          const imageUrl = this.constructImageUrl(mainPhoto?.url);
          console.log('Constructed Image URL:', imageUrl);
          
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

  startEditingProfile() {
    this.editingProfile = true;
  }

  cancelEditingProfile() {
    this.editingProfile = false;
    this.profileForm = {
      displayName: this.user.displayName,
      email: this.user.email,
      phone: this.user.phone,
      location: this.user.location,
      bio: this.user.bio
    };
  }

  saveProfile() {
    // Update user data
    this.user = { ...this.user, ...this.profileForm };
    this.editingProfile = false;
    
    // Update localStorage
    localStorage.setItem('displayName', this.profileForm.displayName);
    
    console.log('Profile updated:', this.profileForm);
  }

  formatMemberSince(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  }

  // Offer management methods
  viewOffer(offer: any) {
    console.log('View offer:', offer);
    // Navigate to offer details based on type
    if (offer.type === 'land') {
      this.router.navigate(['/landOffer', offer.id]);
    } else if (offer.type === 'farmer') {
      this.router.navigate(['/farmerOffer', offer.id]);
    } else if (offer.type === 'equipment') {
      this.router.navigate(['/equipmentOffer', offer.id]);
    }
  }

  editOffer(offer: any) {
    console.log('Edit offer:', offer);
    
    if (offer.type === 'land') {
      alert('Land offer editing is not yet implemented. Please contact support.');
      return;
    }
    
    // For equipment and farmer offers, open edit modal
    this.openEditModal(offer);
  }

  // Edit modal properties
  showEditModal = false;
  editingOffer: any = null;
  editForm: any = {};

  openEditModal(offer: any) {
    this.editingOffer = offer;
    this.showEditModal = true;
    
    // Initialize form with current offer data
    if (offer.type === 'equipment') {
      this.editForm = {
        title: offer.title,
        description: offer.description || '',
        price: offer.price?.replace(' JOD', '') || '',
        location: offer.location,
        condition: offer.originalOffer?.condition || '',
        deliveryType: offer.originalOffer?.deliveryType || '',
        contactNumber: offer.originalOffer?.contactNumber || ''
      };
    } else if (offer.type === 'farmer') {
      this.editForm = {
        fullName: offer.title,
        description: offer.description || '',
        currentAddress: offer.location,
        employmentType: offer.originalOffer?.employmentType || 0,
        age: offer.originalOffer?.age || '',
        contactNumber: offer.originalOffer?.contactNumber || ''
      };
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingOffer = null;
    this.editForm = {};
  }

  saveEdit() {
    if (!this.editingOffer) return;

    if (this.editingOffer.type === 'equipment') {
      this.updateEquipmentOffer();
    } else if (this.editingOffer.type === 'farmer') {
      this.updateFarmerOffer();
    }
  }

  updateEquipmentOffer() {
    const updateDto = {
      title: this.editForm.title,
      description: this.editForm.description,
      price: parseFloat(this.editForm.price),
      location: this.editForm.location,
      condition: this.editForm.condition,
      deliveryType: this.editForm.deliveryType,
      contactNumber: this.editForm.contactNumber
    };

    this.equipmentOfferService.updateOffer(this.editingOffer.id, updateDto).subscribe({
      next: (updatedOffer) => {
        console.log('Equipment offer updated:', updatedOffer);
        // Update the offer in the local array
        const index = this.offers.findIndex(o => o.id === this.editingOffer.id);
        if (index !== -1) {
          this.offers[index] = {
            ...this.offers[index],
            title: updatedOffer.title,
            description: updatedOffer.description,
            price: `${updatedOffer.price} JOD`,
            location: updatedOffer.location,
            originalOffer: updatedOffer
          };
        }
        this.closeEditModal();
        alert('Equipment offer updated successfully!');
      },
      error: (error) => {
        console.error('Error updating equipment offer:', error);
        alert('Error updating offer. Please try again.');
      }
    });
  }

  updateFarmerOffer() {
    const updateDto = {
      fullName: this.editForm.fullName,
      description: this.editForm.description,
      currentAddress: this.editForm.currentAddress,
      employmentType: parseInt(this.editForm.employmentType),
      age: this.editForm.age ? parseInt(this.editForm.age) : undefined,
      contactNumber: this.editForm.contactNumber
    };

    this.farmerOfferService.updateFarmerOffer(this.editingOffer.id, updateDto).subscribe({
      next: (updatedOffer) => {
        console.log('Farmer offer updated:', updatedOffer);
        // Update the offer in the local array
        const index = this.offers.findIndex(o => o.id === this.editingOffer.id);
        if (index !== -1) {
          this.offers[index] = {
            ...this.offers[index],
            title: updatedOffer.fullName,
            description: updatedOffer.description,
            location: updatedOffer.currentAddress,
            price: updatedOffer.employmentType === 0 ? 'Part-Time' : 'Full-Time',
            originalOffer: updatedOffer
          };
        }
        this.closeEditModal();
        alert('Farmer offer updated successfully!');
      },
      error: (error) => {
        console.error('Error updating farmer offer:', error);
        alert('Error updating offer. Please try again.');
      }
    });
  }

  deleteOffer(offer: any) {
    if (confirm('Are you sure you want to delete this offer?')) {
      const originalOffer = offer.originalOffer;
      
      // Delete based on offer type
      let deletePromise;
      switch (offer.type) {
        case 'equipment':
          deletePromise = this.equipmentOfferService.deleteOffer(offer.id).toPromise();
          break;
        case 'farmer':
          deletePromise = this.farmerOfferService.deleteFarmerOffer(offer.id).toPromise();
          break;
        case 'land':
          // Note: LandOfferService doesn't have delete method, so we'll just remove from UI
          this.offers = this.offers.filter(o => o.id !== offer.id);
          console.log('Land offer removed from UI (delete not implemented)');
          return;
        default:
          console.error('Unknown offer type:', offer.type);
          return;
      }
      
      if (deletePromise) {
        deletePromise.then(() => {
          this.offers = this.offers.filter(o => o.id !== offer.id);
          console.log('Offer deleted successfully:', offer.id);
        }).catch(error => {
          console.error('Error deleting offer:', error);
          alert('Error deleting offer. Please try again.');
        });
      }
    }
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
    console.log('Image error for offer:', offer.title, 'Image URL:', offer.image, 'Error:', event);
    offer.image = null;
  }

  onImageLoad(offer: any, event: any) {
    console.log('Image loaded successfully for offer:', offer.title, 'Image URL:', offer.image);
  }

  // Image editing functionality
  triggerImageUpload() {
    const imageInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (imageInput) {
      imageInput.click();
    }
  }

  onImageSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.uploadNewImage(files[i]);
      }
    }
  }

  uploadNewImage(file: File) {
    if (!this.editingOffer) return;

    if (this.editingOffer.type === 'equipment') {
      this.equipmentOfferService.uploadPhoto(this.editingOffer.id, file).subscribe({
        next: (photo) => {
          console.log('New image uploaded:', photo);
          // Add the new photo to the current photos array
          if (!this.editingOffer.originalOffer.photos) {
            this.editingOffer.originalOffer.photos = [];
          }
          this.editingOffer.originalOffer.photos.push(photo);
          alert('Image uploaded successfully!');
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          alert('Error uploading image. Please try again.');
        }
      });
    } else if (this.editingOffer.type === 'farmer') {
      this.farmerOfferService.uploadPhoto(this.editingOffer.id, file).subscribe({
        next: (photo) => {
          console.log('New image uploaded:', photo);
          // Add the new photo to the current photos array
          if (!this.editingOffer.originalOffer.photos) {
            this.editingOffer.originalOffer.photos = [];
          }
          this.editingOffer.originalOffer.photos.push(photo);
          alert('Image uploaded successfully!');
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          alert('Error uploading image. Please try again.');
        }
      });
    }
  }

  removeImage(photoId: number) {
    if (!this.editingOffer) return;

    if (confirm('Are you sure you want to delete this image?')) {
      if (this.editingOffer.type === 'equipment') {
        this.equipmentOfferService.deletePhoto(this.editingOffer.id, photoId).subscribe({
          next: () => {
            console.log('Image deleted successfully');
            // Remove the photo from the current photos array
            this.editingOffer.originalOffer.photos = this.editingOffer.originalOffer.photos.filter((p: any) => p.id !== photoId);
            alert('Image deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting image:', error);
            alert('Error deleting image. Please try again.');
          }
        });
      } else if (this.editingOffer.type === 'farmer') {
        this.farmerOfferService.deletePhoto(this.editingOffer.id, photoId).subscribe({
          next: () => {
            console.log('Image deleted successfully');
            // Remove the photo from the current photos array
            this.editingOffer.originalOffer.photos = this.editingOffer.originalOffer.photos.filter((p: any) => p.id !== photoId);
            alert('Image deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting image:', error);
            alert('Error deleting image. Please try again.');
          }
        });
      }
    }
  }

}
