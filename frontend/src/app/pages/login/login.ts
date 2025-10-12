import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, ViewportScroller } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

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

  constructor(private authService: AuthService, private router: Router, private viewportScroller: ViewportScroller, private route: ActivatedRoute) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['authError']) {
        this.message = params['authError'];
        this.messageType = 'error';
      }
    });
    setTimeout(() => {
      const element = document.getElementById('login-card');
      if (element) {
        const navbarHeight = document.querySelector('nav')?.clientHeight || 0;
        this.viewportScroller.scrollToPosition([0, element.offsetTop - navbarHeight - 10]);
      }
    }, 100);
  }

  async onSubmit(){
    this.submitted = true;
    this.isLoading = true;
    this.message = '';

    if (this.form.invalid) {
      this.isLoading = false;
      return;
    }

    const formValue = this.form.value;
    
    try {
      const response = await firstValueFrom(this.authService.login(formValue.email, formValue.password));
      if (response && response.user) {
        this.authService.currentUserSubject.next(response.user);
        this.router.navigate(['/']);
      } else {
        this.message = 'Login failed. Please try again.';
        this.messageType = 'error';
        this.isLoading = false;
        return;
      }
      this.message = 'Login successful!';
      this.messageType = 'success';
      this.isLoading = false;
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1500);
    } catch (error: any) {
      this.isLoading = false;
      if (error.error && error.error.message) {
        this.message = error.error.message;
      } else {
        this.message = 'Login failed. Please check your credentials.';
      }
      this.messageType = 'error';
    }
  }
}
