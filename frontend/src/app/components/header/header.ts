import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
  }

  get welcomeMessage(): string {
    return 'Food Express';
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
}
