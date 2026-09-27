import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule , RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    cafeName:['',[Validators.required , Validators.minLength(2)]],
    fullName:['',[Validators.required , Validators.minLength(2)]],
    email : ['',[Validators.required , Validators.email]],
    password : ['',[Validators.required , Validators.minLength(6)]]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    if(this.registerForm.invalid){
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.registerForm.getRawValue() as any).subscribe({
      next:()=>{
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error:(err)=>{
        this.isLoading.set(false);
        this.errorMessage.set(
          err.status ===400?'هذا البريد مستخدم بالفعل':'حدث خطء'
        );
      }
    });
  }
  get cafeName(){return this.registerForm.controls.cafeName;}
  get fullName(){return this.registerForm.controls.fullName;}
  get email(){return this.registerForm.controls.email;}
  get password(){return this.registerForm.controls.password;}
}
