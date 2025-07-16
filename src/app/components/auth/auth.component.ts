import { Component, inject, OnInit } from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {Router,RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '@auth0/auth0-angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-auth',
  imports: [MatButtonModule,CommonModule,MatProgressBarModule,MatCardModule,MatChipsModule,MatInputModule,MatFormFieldModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit{
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
      this.authService.isAuthenticated$.subscribe((isAuthenticated)=>{
        if(isAuthenticated){
          this.router.navigate(['/clientes']);
        }
      });
  }

  login(){
    this.authService.loginWithRedirect();
  }
}
