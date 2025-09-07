import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LandOfferService } from '../../core/services/LandOffer.Service';
import { LandOfferCreateDto } from '../../types/LandOffer';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from "../layout/header.component";
import { FooterComponent } from "../layout/footer.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-offer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent, FooterComponent],
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
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.offerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', Validators.required],
      description: ['', [Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(1)]],
      landSize: [null, [Validators.required, Validators.min(10)]],
      isForRent: [true],
      leaseDuration: [null, [Validators.min(0)]]   // only if rent, allow 0
    });
  }

  get f() {
    return this.offerForm.controls;
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
      return;
    }

    this.submitting = true;

    const ownerId = this.authService.getUserId();
    if (!ownerId) {
      this.toastr.error('You must be logged in to create an offer ❌');
      this.submitting = false;
      return;
    }

    const dto: LandOfferCreateDto = {
      ownerId: ownerId,
      title: this.f['title'].value,
      location: this.f['location'].value,
      description: this.f['description'].value || '',
      price: this.f['price'].value || 0,
      isForRent: this.f['isForRent'].value ?? true,
      landSize: this.f['landSize'].value ?? null,
      leaseDuration: this.f['isForRent'].value
        ? (this.f['leaseDuration'].value !== null && this.f['leaseDuration'].value !== undefined && this.f['leaseDuration'].value !== '')
          ? Number(this.f['leaseDuration'].value)
          : null
        : null
    };

    console.log('=== DEBUG LEASE DURATION ===');
    console.log('isForRent value:', this.f['isForRent'].value);
    console.log('leaseDuration raw value:', this.f['leaseDuration'].value);
    console.log('leaseDuration type:', typeof this.f['leaseDuration'].value);
    console.log('leaseDuration after conversion:', this.f['isForRent'].value
      ? (this.f['leaseDuration'].value !== null && this.f['leaseDuration'].value !== undefined && this.f['leaseDuration'].value !== '')
        ? Number(this.f['leaseDuration'].value)
        : null
      : null);
    console.log('Final DTO:', dto);
    console.log('===========================');

    this.api.createOffer(dto).subscribe({
      next: (offer) => {
        if (this.selectedFiles.length > 0) {
          this.selectedFiles.forEach(file => {
            this.api.uploadPhoto(offer.id, file).subscribe();
          });
        }
        this.toastr.success('Offer created successfully ✅');
        this.submitting = false;
        this.offerForm.reset({ isForRent: true });
        this.previewUrls = [];
      },
      error: (err) => {
        console.error('Failed to create offer ❌', err);
        if (err.error?.errors) {
          this.toastr.error('Validation Errors: ' + JSON.stringify(err.error.errors));
        } else {
          this.toastr.error('Failed to create offer ❌');
        }
        this.submitting = false;
      }
    });
  }
}











// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { LandOfferService } from '../../core/services/LandOffer.Service';
// import { LandOfferCreateDto } from '../../types/LandOffer';
// import { AuthService } from '../../core/services/auth.service';
// import { HeaderComponent } from "../layout/header.component";
// import { FooterComponent } from "../layout/footer.component";

// @Component({
//   selector: 'app-add-offer',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent, FooterComponent],
//   templateUrl: './Land-offer.component.html',
//   styleUrls: ['./Land-offer.component.css']
// })
// export class LandOfferComponent {
//   offerForm: FormGroup;
//   submitting = false;
//   previewUrls: string[] = [];
//   selectedFiles: File[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private api: LandOfferService,
//     private authService: AuthService
//   ) {
//     this.offerForm = this.fb.group({
//       title: ['', [Validators.required, Validators.minLength(3)]],
//       location: ['', Validators.required],
//       description: ['', [Validators.maxLength(500)]],
//       price: [0, [Validators.required, Validators.min(1)]],
//       landSize: [null, [Validators.required, Validators.min(10)]],
//       isForRent: [true],
//       leaseDuration: [null]   // shown only if isForRent is true
//     });
//   }

//   get f() {
//     return this.offerForm.controls;
//   }

//   onFileSelected(event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (input.files) {
//       this.selectedFiles = Array.from(input.files);
//       this.previewUrls = [];
//       this.selectedFiles.forEach(file => {
//         const reader = new FileReader();
//         reader.onload = (e: any) => this.previewUrls.push(e.target.result);
//         reader.readAsDataURL(file);
//       });
//     }
//   }

//   submit() {
//     if (this.offerForm.invalid) {
//       this.offerForm.markAllAsTouched();
//       return;
//     }

//     this.submitting = true;

//     const ownerId = this.authService.getUserId();
//     if (!ownerId) {
//       alert('You must be logged in to create an offer ❌');
//       this.submitting = false;
//       return;
//     }

//     const dto: LandOfferCreateDto = {
//       ownerId: ownerId,
//       title: this.f['title'].value,
//       location: this.f['location'].value,
//       description: this.f['description'].value || '',
//       price: this.f['price'].value || 0,
//       isForRent: this.f['isForRent'].value ?? true,
//       landSize: this.f['landSize'].value ?? null,
//       leaseDuration: this.f['isForRent'].value
//         ? Number(this.f['leaseDuration'].value) || null
//         : null
//     };

//     console.log('DTO being sent:', dto);

//     this.api.createOffer(dto).subscribe({
//       next: (offer) => {
//         if (this.selectedFiles.length > 0) {
//           this.selectedFiles.forEach(file => {
//             this.api.uploadPhoto(offer.id, file).subscribe();
//           });
//         }
//         alert('Offer created successfully ✅');
//         this.submitting = false;
//         this.offerForm.reset({ isForRent: true });
//         this.previewUrls = [];
//       },
//       error: (err) => {
//         console.error('Failed to create offer ❌', err);
//         if (err.error?.errors) {
//           console.error('Validation Errors:', err.error.errors);
//           alert('Validation Errors: ' + JSON.stringify(err.error.errors));
//         }
//         this.submitting = false;
//       }
//     });
//   }
// }






// // import { Component } from '@angular/core';
// // import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// // import { CommonModule } from '@angular/common';
// // import { LandOfferService } from '../../core/services/LandOffer.Service';
// // import { LandOfferCreateDto } from '../../types/LandOffer';
// // import { AuthService } from '../../core/services/auth.service';
// // import { HeaderComponent } from "../layout/header.component";
// // import { FooterComponent } from "../layout/footer.component";  // ✅ add AuthService

// // @Component({
// //   selector: 'app-add-offer',
// //   standalone: true,
// //   imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent, FooterComponent],
// //   templateUrl: './Land-offer.component.html',
// //   styleUrls: ['./Land-offer.component.css']
// // })
// // export class LandOfferComponent {
// //   offerForm: FormGroup;
// //   submitting = false;
// //   previewUrls: string[] = [];
// //   selectedFiles: File[] = [];

// //   constructor(
// //     private fb: FormBuilder,
// //     private api: LandOfferService,
// //     private authService: AuthService   // ✅ inject AuthService
// //   ) {
// //   this.offerForm = this.fb.group({
// //   title: ['', Validators.required],
// //   location: ['', Validators.required],
// //   description: [''],
// //   price: [0, Validators.required],
// //   landSize: [null],
// //   isForRent: [true],
// //   leaseDuration: [null]   // ✅ Added
// // });


// //   }

// //   onFileSelected(event: Event) {
// //     const input = event.target as HTMLInputElement;
// //     if (input.files) {
// //       this.selectedFiles = Array.from(input.files);
// //       this.previewUrls = [];
// //       this.selectedFiles.forEach(file => {
// //         const reader = new FileReader();
// //         reader.onload = (e: any) => this.previewUrls.push(e.target.result);
// //         reader.readAsDataURL(file);
// //       });
// //     }
// //   }

// //   submit() {
// //     if (this.offerForm.invalid) return;

// //     this.submitting = true;

// //     // ✅ get logged-in user ID dynamically
// //     const ownerId = this.authService.getUserId();
// //     if (!ownerId) {
// //       alert('You must be logged in to create an offer ❌');
// //       this.submitting = false;
// //       return;
// //     }

// //     // Map form values to backend DTO
// //     const dto: LandOfferCreateDto = {
// //       ownerId: ownerId,
// //       title: this.offerForm.value.title,
// //       location: this.offerForm.value.location,
// //       description: this.offerForm.value.description || '',
// //       price: this.offerForm.value.price || 0,
// //       isForRent: this.offerForm.value.isForRent ?? true,
// //       landSize: this.offerForm.value.landSize ?? null,
// //         leaseDuration: this.offerForm.value.isForRent
// //     ? Number(this.offerForm.value.leaseDuration) || null   
// //     : null    
// //     };

// //     console.log('DTO being sent:', dto);

// //     this.api.createOffer(dto).subscribe({
// //       next: (offer) => {
// //         // Upload photos if any
// //         if (this.selectedFiles.length > 0) {
// //           this.selectedFiles.forEach(file => {
// //             this.api.uploadPhoto(offer.id, file).subscribe();
// //           });
// //         }

// //         alert('Offer created successfully ✅');
// //         this.submitting = false;
// //         this.offerForm.reset({ isForRent: true });
// //         this.previewUrls = [];
// //       },
// //       error: (err) => {
// //         console.error('Failed to create offer ❌', err);
// //         if (err.error?.errors) {
// //           console.error('Validation Errors:', err.error.errors);
// //           alert('Validation Errors: ' + JSON.stringify(err.error.errors));
// //         }
// //         this.submitting = false;
// //       }
// //     });
// //   }
// // }
