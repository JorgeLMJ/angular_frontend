import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private apiUrl = 'http://localhost:8080/paymet'; // URL del backend

  constructor(private http: HttpClient) {}

  createPaymentIntent(amount: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { amount };

    return this.http.post(this.apiUrl, body, { headers });
  }
}