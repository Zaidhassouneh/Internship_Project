import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';

@Component({
  selector: 'app-slideshow-component',
  standalone: true,
  // `@for` doesn't need CommonModule, you can remove it if you like.
  templateUrl: './slideshow-component.html',
  styleUrls: ['./slideshow-component.css']
})
export class SlideshowComponent implements OnInit {
  // If your images are in src/assets/, reference them like this:
  images: string[] = [
    'top-view-garden-tool-with-potatoes-garlic.jpg',
    'tomatoes-growing-garden.jpg',
    'vineyard-background-grape-cultivation-agricultural-landscape.jpg',
    'pexels-jan-kroon-357445-1000057.jpg',
    'green-tea-bud-leaves-green-tea-plantations-morning.jpg'

    // add more images here
  ];

  currentIndex = 0;

  // Inject to manually trigger change detection & clean up
  private cd = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const id = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.cd.markForCheck(); // <-- ensures the DOM updates even in zoneless/OnPush
    }, 5000);

    this.destroyRef.onDestroy(() => clearInterval(id));
  }
}