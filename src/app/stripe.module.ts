// stripe.module.ts
import { NgModule } from '@angular/core';
import { NgxStripeModule } from 'ngx-stripe';

@NgModule({
  imports: [
    NgxStripeModule.forRoot('pk_test_51RPE2pIu8Oc5pDpulOhSc01E9ZBP60UwXM18sU2hjotjGXolW8ILNXEWGzFyc66cm18ivSAxefSlXBCi3G1nncAN00nNCUWGFd'), // Usa tu clave pública aquí
  ],
  exports: [NgxStripeModule], // Exporta NgxStripeModule para que pueda ser usado en otros lugares
})
export class StripeModule {}