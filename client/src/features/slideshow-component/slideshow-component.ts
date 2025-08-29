import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';

@Component({
  selector: 'app-slideshow-component',
  standalone: true,
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
  private intervalId: any;

  // Inject to manually trigger change detection & clean up
  private cd = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.startSlideshow();
    this.destroyRef.onDestroy(() => this.stopSlideshow());
  }

  startSlideshow(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopSlideshow(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.cd.markForCheck();
  }

  previousSlide(): void {
    this.currentIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
    this.cd.markForCheck();
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.cd.markForCheck();
  }
}