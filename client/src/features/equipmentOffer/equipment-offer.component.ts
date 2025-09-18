import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EquipmentOfferService } from '../../core/services/equipment-offer.service';
import { EquipmentOfferCreateDto, DeliveryType } from '../../types/EquipmentOffer';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from "../layout/header.component";
import { FooterComponent } from "../layout/footer.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-equipment-offer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './equipment-offer.component.html',
  styleUrls: ['./equipment-offer.component.css']
})
export class EquipmentOfferComponent {
  offerForm: FormGroup;
  submitting = false;
  previewUrls: string[] = [];
  selectedFiles: File[] = [];
  deliveryTypes = DeliveryType;
  
  deliveryTypeOptions = [
    { value: DeliveryType.SelfPickup, label: 'Self Pickup Only' },
    { value: DeliveryType.DeliveryPaid, label: 'Delivery Available (Additional Fee)' },
    { value: DeliveryType.FreeDelivery, label: 'Free Delivery Included' },
    { value: DeliveryType.DeliveryOnly, label: 'Delivery Only (No Pickup)' }
  ];

  constructor(
    private fb: FormBuilder,
    private api: EquipmentOfferService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.offerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', Validators.required],
      condition: ['', Validators.required],
      description: ['', [Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(1)]],
      deliveryType: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]{7,15}$/)]]
    });
  }

  get f() {
    return this.offerForm.controls;
  }

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


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      
      // Check if adding new files would exceed the limit
      if (this.selectedFiles.length + newFiles.length > 5) {
        this.toastr.warning('Maximum 5 images allowed. Please remove some images first.');
        return;
      }
      
      // Add new files to existing ones
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      
      // Generate previews for new files only
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => this.previewUrls.push(e.target.result);
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  triggerFileInput() {
    const fileInput = document.querySelector('.file-input-hidden') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  submit() {
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      this.toastr.error('Please fix the validation errors ❌');
      console.log('Form validation errors:', this.offerForm.errors);
      console.log('Form controls:', this.offerForm.controls);
      return;
    }

    this.submitting = true;

    const ownerId = this.authService.getUserId();
    if (!ownerId) {
      this.toastr.error('You must be logged in to create an offer ❌');
      this.submitting = false;
      return;
    }

    const dto: EquipmentOfferCreateDto = {
      ownerId: ownerId,
      title: this.f['title'].value?.trim() || '',
      location: this.f['location'].value?.trim() || '',
      condition: this.f['condition'].value?.trim() || '',
      description: this.f['description'].value?.trim() || '',
      price: this.f['price'].value || 0,
      deliveryType: this.f['deliveryType'].value,
      contactNumber: this.f['contactNumber'].value?.trim() || null
    };

    console.log('DTO being sent:', dto);
    console.log('Form values:', this.offerForm.value);
    console.log('DeliveryType value:', this.f['deliveryType'].value, typeof this.f['deliveryType'].value);

    this.api.createOffer(dto).subscribe({
      next: (offer) => {
        if (this.selectedFiles.length > 0) {
          this.selectedFiles.forEach(file => {
            this.api.uploadPhoto(offer.id, file).subscribe();
          });
        }
        this.toastr.success('Equipment offer created successfully ✅');
        this.submitting = false;
        this.offerForm.reset();
        this.previewUrls = [];
        this.selectedFiles = [];
      },
      error: (err) => {
        console.error('Failed to create equipment offer ❌', err);
        console.error('Error details:', err.error);
        if (err.error?.errors) {
          this.toastr.error('Validation Errors: ' + JSON.stringify(err.error.errors));
        } else if (err.error?.title) {
          this.toastr.error('Error: ' + err.error.title);
        } else {
          this.toastr.error('Failed to create equipment offer ❌');
        }
        this.submitting = false;
      }
    });
  }
}
