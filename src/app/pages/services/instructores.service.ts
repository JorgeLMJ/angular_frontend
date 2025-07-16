import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Instructores } from '../models/instructores';

@Injectable({
  providedIn: 'root'
})
export class InstructoresService {

  private apiUrl = ' http://localhost:8080/instructores';

  constructor(private http: HttpClient) { }

  getInstructores(): Observable<Instructores[]> {
    return this.http.get<Instructores[]>(this.apiUrl);
  }

  getInstructorById(id: number): Observable<Instructores> {
    return this.http.get<Instructores>(`${this.apiUrl}/${id}`);
  }

  createInstructor(instructores: Instructores): Observable<Instructores> {
    return this.http.post<Instructores>(this.apiUrl, instructores);
  }

  updateInstructor(instructores: Instructores) {
    return this.http.put(this.apiUrl, instructores);
  }

  deleteInstructor(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  checkFieldExists(field: string, value: any): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists?field=${field}&value=${value}`);
  }
}
