import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  menuOpen = input<boolean>(false);
  role = input<string>('user');

  menuToggled = output<void>();
  logoutClicked = output<void>();

  onLinkClick() {
    this.menuToggled.emit();
  }
}


