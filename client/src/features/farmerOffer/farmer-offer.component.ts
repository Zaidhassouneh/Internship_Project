import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FarmerOfferService } from '../../core/services/farmer-offer.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-farmer-offer',
  templateUrl: './farmer-offer.component.html',
  styleUrls: ['./farmer-offer.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent]
})
export class FarmerOfferComponent implements OnInit {
  farmerOfferForm!: FormGroup;
  selectedFiles: File[] = [];
  isSubmitting = false;
  previewUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private farmerOfferService: FarmerOfferService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.farmerOfferForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)]],
      emailAddress: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      currentAddress: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      age: [null, [Validators.min(18), Validators.max(100)]]
    });
  }

  get f() {
    return this.farmerOfferForm.controls;
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

  onSubmit() {
    if (this.farmerOfferForm.invalid) {
      this.farmerOfferForm.markAllAsTouched();
      this.toastr.error('Please fix the validation errors ❌');
      return;
    }

    this.isSubmitting = true;

    const ownerId = this.authService.getUserId();
    if (!ownerId) {
      this.toastr.error('You must be logged in to create an offer ❌');
      this.isSubmitting = false;
      return;
    }

    const farmerOfferData = {
      ownerId: ownerId,
      fullName: this.f['fullName'].value,
      contactNumber: this.f['contactNumber'].value,
      emailAddress: this.f['emailAddress'].value,
      currentAddress: this.f['currentAddress'].value,
      description: this.f['description'].value,
      age: this.f['age'].value || null
    };

    this.farmerOfferService.createFarmerOffer(farmerOfferData).subscribe({
      next: (response) => {
        if (this.selectedFiles.length > 0) {
          this.selectedFiles.forEach(file => {
            this.farmerOfferService.uploadPhoto(response.id, file).subscribe();
          });
        }
        this.toastr.success('Farmer offer published successfully ✅');
        this.isSubmitting = false;
        this.farmerOfferForm.reset();
        this.previewUrls = [];
        this.selectedFiles = [];
      },
      error: (error) => {
        console.error('Failed to create farmer offer ❌', error);
        if (error.error?.errors) {
          this.toastr.error('Validation Errors: ' + JSON.stringify(error.error.errors));
        } else {
          this.toastr.error('Failed to publish farmer offer ❌');
        }
        this.isSubmitting = false;
      }
    });
  }

}