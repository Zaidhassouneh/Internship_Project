import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginDto } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink,CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData: LoginDto = { email: '', password: '' };
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.loginData).subscribe({
    next: res => {
      console.log('Login successful', res);
      localStorage.setItem('displayName', res.user.displayName); // Save display name
      // ✅ Save both tokens
      localStorage.setItem('token', res.token);
      localStorage.setItem('refreshToken', res.refreshToken);

      this.error = '';
      this.router.navigate(['/home']);
      },
     error: err => {
  if (err.error && err.error.errors) {
    this.error = Object.values(err.error.errors).flat().join(', ');
  } else if (typeof err.error === 'object' && err.error !== null) {
    this.error = err.error.message || JSON.stringify(err.error);
  } else {
    this.error = err.error || 'Login failed';
  }
}
    });
  }
}
