import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Instructores } from '../models/instructores';
import { InstructoresService } from '../services/instructores.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-instructores',
  imports: [MatCardModule, RouterModule, FormsModule,CommonModule],
  templateUrl: './instructores.component.html',
  styleUrl: './instructores.component.css'
})
export class InstructoresComponent {
  instructores: Instructores[] = [];
  filteredInstructores: Instructores[] = [];
  searchTerm: string = '';
  isDeleteProgress: boolean = false;
  // Para filtros de estado
filterActivo: boolean = true;
filterInactivo: boolean = true;
  
  // Variables de paginación
  page: number = 1;
  pageSize: number = 5;

  constructor(private instructoresService: InstructoresService) { }

  ngOnInit(): void {
    this.getAllInstructores();
  }

  getAllInstructores() {
    this.instructoresService.getInstructores().subscribe((data)=>{
        this.instructores = data;
        this.filterInstructoresCheckBox(); // Aplicar filtros iniciales
      });
    }


 /* deleteInstructores(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.instructoresService.deleteInstructor(id).subscribe({
        next: () => {
          this.instructores = this.instructores.filter(c => c.id !== id);
          this.filterInstructores(); // Actualizar la lista filtrada
          alert('Cliente eliminado');
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar el cliente');
        }
      });
    }
  }*/

  // Método de filtrado
  filterInstructores() {
    if (!this.searchTerm) {
      this.filteredInstructores = [...this.instructores];
      this.page = 1; // Resetear a la primera página
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredInstructores = this.instructores.filter(instructor => 
      Object.values(instructor).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
    this.page = 1; // Resetear a la primera página al aplicar filtro
  }

  // Método único de filtrado: texto + checkboxes

filterInstructoresCheckBox() {
  let filtered = [...this.instructores];

  // Filtrar por término de búsqueda
  if (this.searchTerm) {
    const searchTermLower = this.searchTerm.toLowerCase();
    filtered = filtered.filter(instructor =>
      Object.values(instructor).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
  }

  // Filtrar por estados seleccionados
  filtered = filtered.filter(instructor => {
    return (
      (this.filterActivo && instructor.estado === 'Activo') ||
      (this.filterInactivo && instructor.estado === 'Inactivo')
    );
  });

  this.filteredInstructores = filtered;
  this.page = 1; // Resetear a la primera página al aplicar filtro
}
  // Getter para clientes paginados
  get paginatedInstructores() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredInstructores.slice(start, start + this.pageSize);
  }

  // Getter para total de páginas
  get totalPages() {
    return Math.ceil(this.filteredInstructores.length / this.pageSize);
  }

  // Métodos de navegación
  previousPage() {
    if (this.page > 1) this.page--;
  }

  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }
  /*exportar en excel y pdf*/
  exportToExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.instructores);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Instructores');
    XLSX.writeFile(wb, 'instructores.xlsx');
  }
  

}
