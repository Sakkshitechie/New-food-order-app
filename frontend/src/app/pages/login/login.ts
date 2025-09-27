import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, ViewportScroller } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit{

  form:FormGroup;
  submitted:boolean=false;
  message: string = '';
  messageType: string = '';
  isLoading:boolean=false;

  constructor(private authService: AuthService, private router: Router, private viewportScroller: ViewportScroller) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      const element = document.getElementById('login-card');
      if (element) {
        const navbarHeight = document.querySelector('nav')?.clientHeight || 0;
        this.viewportScroller.scrollToPosition([0, element.offsetTop - navbarHeight - 10]); //Adjust for navbar height + margin
      }
    }, 100);
  }

  onSubmit(){
    this.submitted = true;
    this.isLoading = true;
    this.message = '';

    if (this.form.invalid) {
      this.isLoading = false;
      return;
    }

    const formValue = this.form.value;
    
    // Pure HTTP call - backend handles everything
    this.authService.login(formValue.email, formValue.password).subscribe(
      (data) => {
        this.message = 'Login successful!';
        this.messageType = 'success';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      }
    );
  }
}
