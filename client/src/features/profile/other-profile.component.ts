import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';

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
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
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
}
