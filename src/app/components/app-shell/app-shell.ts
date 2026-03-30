import { Component, input, output } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  menuOpen = input<boolean>(false);
  role = input<string>('user');

  menuToggled = output<void>();
  logoutClicked = output<void>();
}

