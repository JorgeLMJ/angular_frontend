import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, StripeCardElement } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
    private apiUrl = 'http://localhost:8080/api/payments';
  
    constructor(private http: HttpClient) {}
  
    async createPayment(amount: number, card: StripeCardElement): Promise<void> {
        try {
          // Realiza la solicitud POST al backend para obtener el clientSecret
          const response = await this.http.post<{ clientSecret: string }>(
            `${this.apiUrl}/create-payment-intent`,
            { amount } // Envia el monto al backend
          ).toPromise();
      
          // Verifica si la respuesta es válida
          if (!response || !response.clientSecret) {
            throw new Error('La respuesta del servidor no contiene un clientSecret válido.');
          }
      
          // Carga la biblioteca de Stripe
          const stripe = await loadStripe('pk_test_51RPE2pIu8Oc5pDpulOhSc01E9ZBP60UwXM18sU2hjotjGXolW8ILNXEWGzFyc66cm18ivSAxefSlXBCi3G1nncAN00nNCUWGFd');
          if (stripe) {
            // Confirma el pago usando el clientSecret obtenido del backend
            const { error } = await stripe.confirmCardPayment(response.clientSecret, {
              payment_method: {
                card: card,
              },
            });
      
            if (error) {
              console.error('Error:', error);
            } else {
              console.log('Pago exitoso');
            }
          }
        } catch (error) {
          console.error('Error al crear el PaymentIntent:', error);
        }
      }
  

  }

