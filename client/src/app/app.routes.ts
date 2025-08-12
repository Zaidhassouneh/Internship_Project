import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login.component';
import { RegisterComponent } from '../features/auth/register.component';
import { HomeComponent } from '../features/home/home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];