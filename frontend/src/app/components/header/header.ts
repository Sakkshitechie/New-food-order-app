import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  
  constructor() {}

  ngOnInit(): void {
  }

  get welcomeMessage(): string {
    return 'Food Express'; // Static message since no auth state management
  }

  get isLoggedIn(): boolean {
    return false; // Static since no auth state management
  }
}
