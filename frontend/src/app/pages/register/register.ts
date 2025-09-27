import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, ReactiveFormsModule, FormControl, FormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, ViewportScroller } from '@angular/common';
import { User } from '../../Models/User';
 
@Component({
  selector: 'app-register',
  imports: [CommonModule,ReactiveFormsModule,RouterLink,FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit
 {

  form:FormGroup;
  submitted:boolean=false;
  message: string = '';
  messageType: string = '';

  constructor(private authService: AuthService, private router: Router, private viewportScroller: ViewportScroller) {
      this.form = new FormGroup({
        name: new FormControl('', [
          Validators.required,
          Validators.pattern(/^[A-Za-z\s]+$/)
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        ]),
        phone: new FormControl('', [
          Validators.required,
          Validators.pattern(/^[6-9]{1}\d{9}$/)
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6)
        ]),
        confirmPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(6)
        ])
      }, [this.passwordMatchValidator]);
  }

  ngOnInit(): void {
    setTimeout(() => {
      const element = document.getElementById('register-card');
      if (element) {
        const navbarHeight = document.querySelector('nav')?.clientHeight || 0;
        this.viewportScroller.scrollToPosition([0, element.offsetTop - navbarHeight - 10]); // Adjust for navbar height + margin
      }
    }, 100);
  }

  onRegister(){
    const { confirmPassword, ...userData } = this.form.value;
    const user: User = {
      id: 0, 
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone
    };
    
    this.authService.register(user).subscribe(
      (data) => {
        this.message = 'Registration successful!';
        this.messageType = 'success';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      }
    );
  }
  passwordMatchValidator(control: AbstractControl) {
    const form = control as FormGroup;
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
}