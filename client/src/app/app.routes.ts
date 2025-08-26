import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login.component';
import { RegisterComponent } from '../features/auth/register.component';
import { HomeComponent } from '../features/home/home.component';
import { authGuard } from '../core/guards/auth.guard';
import { LandOfferComponent } from '../features/landOffer/Land-offer.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'landOffer', component: LandOfferComponent, canActivate: [authGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

