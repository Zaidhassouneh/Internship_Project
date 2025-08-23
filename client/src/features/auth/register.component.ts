import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterDto } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
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

  constructor(private authService: AuthService,private router: Router) {}

  onSubmit() {
    this.authService.register(this.registerData).subscribe({
      next: res => {
        // Save token, redirect, etc.
        localStorage.setItem('token', res.token);
        localStorage.setItem('displayName', res.user.displayName);
        this.error = '';
         this.router.navigate(['/home']);
       
      },
      error: err => {
        if (err.error && err.error.errors) {
          // ASP.NET validation error format
          this.error = Object.values(err.error.errors).flat().join(', ');
        } else if (Array.isArray(err.error)) {
          this.error = err.error.join(', ');
          console.log(2)
        } else if (typeof err.error === 'object' && err.error !== null) {
          this.error = err.error.message || JSON.stringify(err.error);
          console.log(3)
        } else {
          this.error = err.error || 'Registration failed';
        console.log(4)
        }
      }
    });
  }
}
