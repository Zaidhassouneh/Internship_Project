import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';
import { AuthService } from '../../core/services/auth.service';

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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserProfile();
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
}
