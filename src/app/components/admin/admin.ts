import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent {
  auth   = inject(AuthService);
  router = inject(Router);
}
