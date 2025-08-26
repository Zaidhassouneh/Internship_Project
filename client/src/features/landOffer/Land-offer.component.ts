import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LandOfferService } from '../../core/services/LandOffer.Service';
import { LandOfferCreateDto } from '../../types/LandOffer';
import { AuthService } from '../../core/services/auth.service';  // ✅ add AuthService

@Component({
  selector: 'app-add-offer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './Land-offer.component.html',
  styleUrls: ['./Land-offer.component.css']
})
export class LandOfferComponent {
  offerForm: FormGroup;
  submitting = false;
  previewUrls: string[] = [];
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private api: LandOfferService,
    private authService: AuthService   // ✅ inject AuthService
  ) {
  this.offerForm = this.fb.group({
  title: ['', Validators.required],
  location: ['', Validators.required],
  description: [''],
  price: [0, Validators.required],
  landSize: [null],
  isForRent: [true],
  leaseDuration: [null]   // ✅ Added
});


  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.previewUrls = [];
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => this.previewUrls.push(e.target.result);
        reader.readAsDataURL(file);
      });
    }
  }

  submit() {
    if (this.offerForm.invalid) return;

    this.submitting = true;

    // ✅ get logged-in user ID dynamically
    const ownerId = this.authService.getUserId();
    if (!ownerId) {
      alert('You must be logged in to create an offer ❌');
      this.submitting = false;
      return;
    }

    // Map form values to backend DTO
    const dto: LandOfferCreateDto = {
      ownerId: ownerId,
      title: this.offerForm.value.title,
      location: this.offerForm.value.location,
      description: this.offerForm.value.description || '',
      price: this.offerForm.value.price || 0,
      isForRent: this.offerForm.value.isForRent ?? true,
      landSize: this.offerForm.value.landSize ?? null,
      leaseDuration: this.offerForm.value.leaseDuration ?? null 
    };

    console.log('DTO being sent:', dto);

    this.api.createOffer(dto).subscribe({
      next: (offer) => {
        // Upload photos if any
        if (this.selectedFiles.length > 0) {
          this.selectedFiles.forEach(file => {
            this.api.uploadPhoto(offer.id, file).subscribe();
          });
        }

        alert('Offer created successfully ✅');
        this.submitting = false;
        this.offerForm.reset({ isForRent: true });
        this.previewUrls = [];
      },
      error: (err) => {
        console.error('Failed to create offer ❌', err);
        if (err.error?.errors) {
          console.error('Validation Errors:', err.error.errors);
          alert('Validation Errors: ' + JSON.stringify(err.error.errors));
        }
        this.submitting = false;
      }
    });
  }
}
