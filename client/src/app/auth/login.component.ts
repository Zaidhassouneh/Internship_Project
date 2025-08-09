import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginDto } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData: LoginDto = { email: '', password: '' };
  error: string = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.login(this.loginData).subscribe({
      next: res => {
        console.log('Login successful', res);
        // Save token, redirect, etc.
        localStorage.setItem('token', res.token);
        this.error = '';
        // ...navigate to dashboard or home
      },
      error: err => {
        this.error = err.error || 'Login failed';
      }
    });
  }
}
