import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login.component';
import { RegisterComponent } from '../features/auth/register.component';
import { HomeComponent } from '../features/home/home.component';
import { AboutComponent } from '../features/about/about.component';
import { ContactComponent } from '../features/contact/contact.component';
import { authGuard } from '../core/guards/auth.guard';
import { LandOfferComponent } from '../features/landOffer/Land-offer.component';
import { LandOfferDetailsComponent } from '../features/landOffer/land-offer-details.component';
import { FarmerOfferComponent } from '../features/farmerOffer/farmer-offer.component';
import { FarmerOfferDetailsComponent } from '../features/farmerOffer/farmer-offer-details.component';
import { EquipmentOfferComponent } from '../features/equipmentOffer/equipment-offer.component';
import { EquipmentOfferDetailsComponent } from '../features/equipmentOffer/equipment-offer-details.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'landOffer', component: LandOfferComponent, canActivate: [authGuard] },
  { path: 'landOffer/:id', component: LandOfferDetailsComponent, canActivate: [authGuard] },
  { path: 'farmerOffer', component: FarmerOfferComponent, canActivate: [authGuard] },
  { path: 'farmerOffer/:id', component: FarmerOfferDetailsComponent, canActivate: [authGuard] },
  { path: 'equipmentOffer', component: EquipmentOfferComponent, canActivate: [authGuard] },
  { path: 'equipmentOffer/:id', component: EquipmentOfferDetailsComponent, canActivate: [authGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

