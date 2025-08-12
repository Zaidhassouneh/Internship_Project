import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
<header class="bg-white border-bottom py-2">
  <nav class="container d-flex justify-content-center gap-3">
    <button type="button" class="btn btn-outline-success">Home</button>
    <button type="button" class="btn btn-outline-success">Education</button>
    <button type="button" class="btn btn-outline-success">About</button>
    <button type="button" class="btn btn-outline-success">Contact</button>
  </nav>
</header>



  `
})
export class HeaderComponent {}
