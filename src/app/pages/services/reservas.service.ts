import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,map } from 'rxjs';
import { Reservas } from '../models/reservas';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  private apiUrl = ' http://localhost:8080/reservas';

  constructor(private http: HttpClient) { }

  getReservas(): Observable<Reservas[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((reservas: any[]) =>
        reservas.map((reserva: any) => ({
          id: reserva.id,
          horario: reserva.horario,
          fecha: reserva.fecha,
          precio: reserva.precio,
          actividad: reserva.actividad,
          idCliente: `${reserva.cliente?.name || ''} ${reserva.cliente?.surname || ''}`.trim(),
          idInstructor: `${reserva.instructor?.name || ''} ${reserva.instructor?.surname || ''}`.trim(),
          telefonoCliente: reserva.cliente?.phoneNumber?.toString() || '',
        }))
      )
    );
  }
  

  getReservaById(id: number): Observable<Reservas> {
    return this.http.get<Reservas>(`${this.apiUrl}/${id}`);
  }

  createReserva(reservas: Reservas): Observable<Reservas> {
    console.log(reservas);
    return this.http.post<Reservas>(this.apiUrl, reservas);
  }

  updateReserva(reservas: Reservas) {
    return this.http.put(this.apiUrl, reservas);
  }

  deleteReservas(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
