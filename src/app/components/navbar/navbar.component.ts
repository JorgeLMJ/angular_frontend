import { Component, inject, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    MatToolbarModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService); // Inyección de AuthService
  isCollapsed: boolean = false; // Controla si el menú está colapsado o no

  ngOnInit(): void {
    // Subscribirse a los datos del usuario
    this.authService.user$.subscribe((user) => {
      if (user) {
        console.log('Usuario:', user);
      }
    });

    // Subscribirse a los claims del token
    this.authService.idTokenClaims$.subscribe((claims) => {
      console.log('Token Claims:', claims);
    });
  }

  // Método para alternar el estado del menú (colapsado/desplegado)
  toggleMenu(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // Método para cerrar sesión
  logout(): void {
    this.authService.logout();
  }
}