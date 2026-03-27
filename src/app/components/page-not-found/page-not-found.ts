import { isPlatformBrowser, Location } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [],
  templateUrl: './page-not-found.html',
  styleUrls: ['./page-not-found.css']
})
export class PageNotFoundComponent {
  private location = inject(Location);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  goBack(): void {
    if (isPlatformBrowser(this.platformId) && window.history.length > 1) {
      this.location.back();
      return;
    }

    this.router.navigate(['/']);
  }
}
