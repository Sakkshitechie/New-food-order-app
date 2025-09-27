import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router } from '@angular/router';
 
@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterLink,RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  isOpen = false;
  username: string = 'User'; // Static username for demo
  
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Static initialization since no auth state management
  }

  get isLoggedIn(): boolean {
    return false; // Static since no auth state management in pure HTTP approach
  }

  logout() {
    // Pure HTTP call - backend handles everything
    this.authService.logout().subscribe(
      (data) => {
        this.router.navigate(['/']);
      }
    );
  }
}
