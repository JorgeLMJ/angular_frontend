import { Component, inject, OnDestroy, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from '@auth0/auth0-angular';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StripeModule } from './stripe.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,MatButtonModule,NavbarComponent, CommonModule,StripeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  isAuthenticated:boolean = false;
  ngOnInit(): void {
      this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(isAuthenticated =>{
        this.isAuthenticated = isAuthenticated;
      })
  }

  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete(); 
  }
}
