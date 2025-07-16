import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Clientes } from '../models/clientes';
import { ClientesService } from '../services/clientes.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-clientes',
  imports: [MatCardModule, RouterModule, FormsModule,CommonModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent {
  clientes: Clientes[] = [];
  filteredClientes: Clientes[] = [];
  searchTerm: string = '';
  isDeleteProgress: boolean = false;

  // Variables para los filtros rápidos
  filterPendiente: boolean = true;
  filterAtendido: boolean = true;
  filterIgnorado: boolean = true;
  filterEsperando: boolean = true;

  // Variables de paginación
  page: number = 1;
  pageSize: number = 5;

  constructor(private clienteService: ClientesService) {}

  ngOnInit(): void {
    this.getAllClientes();
  }

  getAllClientes() {
    this.clienteService.getClientes().subscribe((data) => {
      this.clientes = data;
      this.filterClientes(); // Aplicar filtros iniciales
    });
  }

  deleteClientes(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clienteService.deleteClientes(id).subscribe({
          next: () => {
            this.getAllClientes(); // Recargar lista
            Swal.fire(
              '¡Eliminado!',
              'El cliente ha sido eliminado.',
              'success'
            );
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Swal.fire(
              'Error',
              'No se pudo eliminar el cliente.',
              'error'
            );
          }
        });
      }
    });
  }

  // Método de filtrado combinado
  filterClientes() {
    let filtered = [...this.clientes];

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cliente =>
        Object.values(cliente).some(value =>
          String(value).toLowerCase().includes(searchTermLower)
        )
      );
    }

    // Filtrar por estados seleccionados
    filtered = filtered.filter(cliente => {
      return (
        (this.filterPendiente && cliente.estado === 'pendiente') ||
        (this.filterAtendido && cliente.estado === 'atendido') ||
        (this.filterEsperando && cliente.estado === 'pagado')||
        (this.filterIgnorado && cliente.estado === 'ignorado')
      );
    });

    this.filteredClientes = filtered;
    this.page = 1; // Resetear a la primera página al aplicar filtro
  }

  // Getter para clientes paginados
  get paginatedClientes() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredClientes.slice(start, start + this.pageSize);
  }

  // Getter para total de páginas
  get totalPages() {
    return Math.ceil(this.filteredClientes.length / this.pageSize);
  }

  // Métodos de navegación
  previousPage() {
    if (this.page > 1) this.page--;
  }

  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  /* Exportar en Excel y PDF */
  exportToExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.clientes);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    XLSX.writeFile(wb, 'clientes.xlsx');
  }

  /*exportToPDF() {
    const doc = new jsPDF();
    let yPos = 20;

    this.clientes.forEach((cliente, index) => {
      doc.text(`Cliente ${index + 1}:`, 20, yPos);
      yPos += 10;
      doc.text(`Nombres y apellidos: ${cliente.name} ${cliente.surname}`, 20, yPos);
      yPos += 10;

      doc.text(`Email: ${cliente.email}`, 20, yPos);
      yPos += 10;
      doc.text(`Teléfono: ${cliente.phoneNumber}`, 20, yPos);
      yPos += 10;
      doc.text(`Fecha de registro: ${cliente.fechaRegistro}`, 20, yPos);
      yPos += 10;
      // doc.text(`Estado: ${cliente.estado}`, 20, yPos);
      yPos += 15;
    });

    doc.save('clientes.pdf');
  }*/
  exportToPDF(): void {
    const DATA = document.getElementById('tabla-clientes');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
  
    html2canvas(DATA!, options).then((canvas) => {
      const img = canvas.toDataURL('image/PNG');
      const bufferX = 15;
      const bufferY = 15;
      const imgProps = doc.getImageProperties(img);
      const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
      doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight);
      doc.save('clientes.pdf');
    });
  }
}