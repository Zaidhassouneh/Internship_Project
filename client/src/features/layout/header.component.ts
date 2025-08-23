import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import{ RouterLink } from '@angular/router';
@Component({
  selector: 'app-header',
  imports:[RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isSidebarOpen = false;
  userName: string = localStorage.getItem('displayName') || 'User';
  constructor(private router: Router,private authService: AuthService) {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

 logout(): void {
    localStorage.removeItem('token'); // ✅ remove saved token
    this.closeSidebar(); // close sidebar
    this.router.navigate(['/login']); // redirect to login page
  }
}