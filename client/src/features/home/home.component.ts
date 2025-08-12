import { Component } from '@angular/core';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, FooterComponent],
  templateUrl:'./home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {}
