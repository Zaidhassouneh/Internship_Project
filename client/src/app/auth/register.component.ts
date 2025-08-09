import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterDto } from './auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData: RegisterDto = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  error: string = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.register(this.registerData).subscribe({
      next: res => {
        // Save token, redirect, etc.
        localStorage.setItem('token', res.token);
        this.error = '';
        // ...navigate to dashboard or home
      },
      error: err => {
        if (Array.isArray(err.error)) {
          this.error = err.error.join(', ');
        } else if (typeof err.error === 'object' && err.error !== null) {
          this.error = err.error.message || JSON.stringify(err.error);
        } else {
          this.error = err.error || 'Registration failed';
        }
      }
    });
  }
}
