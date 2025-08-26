import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthResponseDto, LoginDto, RegisterDto } from '../../types/Auth';
import { environment } from '../../environments/environment';


@Injectable({ 
  providedIn: 'root' 
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  
  constructor(private http: HttpClient) {}

  register(data: RegisterDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/auth/register`, data);
  }

  login(data: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/auth/login`, data);
  }
   // ✅ helper: get logged in userId
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }
  
}
