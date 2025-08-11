import { Component } from '@angular/core';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <div class="container mt-5 mb-5">
      <!-- Home content goes here -->
    </div>
    <app-footer></app-footer>
  `
})
export class HomeComponent {}
