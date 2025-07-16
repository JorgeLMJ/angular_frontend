import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Clientes } from '../models/clientes';
import { environment } from '../../../environments/environment.prod'; 

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private apiUrl = `${environment.apiUrl}/api/clientes`;

  constructor(private http: HttpClient) { }

  getClientes(): Observable<Clientes[]> {
    return this.http.get<Clientes[]>(this.apiUrl);
  }

  getClienteById(id: number): Observable<Clientes> {
    return this.http.get<Clientes>(`${this.apiUrl}/${id}`);
  }

  createCliente(clientes: Clientes): Observable<Clientes> {
    return this.http.post<Clientes>(this.apiUrl, clientes);
  }

  updateCliente(clientes: Clientes) {
    return this.http.put(this.apiUrl, clientes);
  }

  deleteClientes(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  checkFieldExists(field: string, value: any): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists?field=${field}&value=${value}`);
  }
}
