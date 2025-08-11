import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
  <button class="btn btn-primary">Test Button</button>
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
          <div class="container-fluid">
        <a class="navbar-brand" href="#">Internship Project</a>
      </div>
    </nav>
  `
})
export class HeaderComponent {}
