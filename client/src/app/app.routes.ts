import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login.component';
import { RegisterComponent } from '../features/auth/register.component';
import { HomeComponent } from '../features/home/home.component';
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

    //   { path: '', component:LoginComponent  },
    // {
    //     path: '',
    //     runGuardsAndResolvers: 'always',
    //     canActivate: [authGuard],
    //     children: [
    //         { path: 'home', component: HomeComponent },
           
    //     ]
    // },
    // { path: '**', component: LoginComponent },