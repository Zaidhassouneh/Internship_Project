import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
<footer style="background-color: #1b5e20;" class="text-light pt-4">
  <div class="container text-center text-md-start">
    <div class="row">
      <div class="col-md-6 mb-3">
        <h5 class="fw-bold">GreenBridge</h5>
        <p>Connecting farmers and communities with sustainable solutions.</p>
      </div>
      <div class="col-md-3 mb-3">
        <h6 class="fw-bold">Links</h6>
        <ul class="list-unstyled">
          <li><a href="#" class="text-light text-decoration-none">Home</a></li>
          <li><a href="#" class="text-light text-decoration-none">About Us</a></li>
          <li><a href="#" class="text-light text-decoration-none">Contact</a></li>
        </ul>
      </div>
      <div class="col-md-3 mb-3">
        <h6 class="fw-bold">Follow Us</h6>
        <a href="#" class="text-light me-2"><i class="bi bi-facebook"></i></a>
        <a href="#" class="text-light me-2"><i class="bi bi-twitter"></i></a>
        <a href="#" class="text-light"><i class="bi bi-linkedin"></i></a>
      </div>
    </div>
  </div>
  <div class="text-center py-3 border-top border-secondary mt-3">
    © 2025 GreenBridge
  </div>
</footer>


  `
})
export class FooterComponent {}
