import { Component } from '@angular/core';
import { Reservas } from '../models/reservas';
import { Clientes } from '../models/clientes';
import { ReservasService } from '../services/reservas.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent {
  reservas: Reservas[] = [];
  filteredReservas: Reservas[] = [];
  searchTerm: string = '';
  isDeleteProgress: boolean = false;

  // Variables de paginación
  page: number = 1;
  pageSize: number = 5;

  constructor(private reservasService: ReservasService) { }

  ngOnInit(): void {
    this.getAllReservas();
  }

  getAllReservas() {
    this.reservasService.getReservas().subscribe((data) => {
      this.reservas = data;
      this.filteredReservas = [...this.reservas]; // Inicializar con todos los clientes
    });
  }

 /* deleteReservas(id: number) {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
      this.reservasService.deleteReservas(id).subscribe({
        next: () => {
          // this.reservas = this.reservas.filter(c => c.id !== id);
          // this.filterReservas(); // Actualizar la lista filtrada
          alert('Reserva eliminado');
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar la reserva');
        }
      });
    }
  }*/

  // Método de filtrado
  filterReservas() {
    if (!this.searchTerm) {
      this.filteredReservas = [...this.reservas];
      this.page = 1; // Resetear a la primera página
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredReservas = this.reservas.filter(instructor =>
      Object.values(instructor).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
    this.page = 1; // Resetear a la primera página al aplicar filtro
  }

  // Getter para clientes paginados
  get paginatedReservas() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredReservas.slice(start, start + this.pageSize);
  }

  // Getter para total de páginas
  get totalPages() {
    return Math.ceil(this.filteredReservas.length / this.pageSize);
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
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.reservas);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
    XLSX.writeFile(wb, 'reservas.xlsx');
  }
  /*generar boleta*/
  boletaVisible = false;
  boletaReserva: Reservas | null = null;

  abrirBoleta(reserva: Reservas) {
    this.boletaReserva = reserva;
    this.boletaVisible = true;
  }

  cerrarBoleta() {
    this.boletaVisible = false;
    this.boletaReserva = null;
  }

  imprimirBoleta() {
  const contenido = document.querySelector('.boleta-container')?.innerHTML;

  if (!contenido) {
    alert('No se encontró el contenido de la boleta.');
    return;
  }

  const ventana = window.open('', '_blank');
  if (!ventana) {
    alert('La ventana emergente fue bloqueada.');
    return;
  }

  ventana.document.write(`
    <html>
      <head>
        <title>Boleta - ButiGym</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
            background-color: #fff;
            color: #333;
          }
          .boleta-container {
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            max-width: 450px;
            width: 100%;
            margin: auto;
            box-shadow: none;
          }
          .boleta-header h3 {
            text-align: center;
            color: #3f51b5;
            font-size: 22px;
            margin-bottom: 20px;
          }
          .header-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .left-column, .right-column {
            width: 50%;
          }
          .prestaciones-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .prestaciones-table th, .prestaciones-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          .prestaciones-table th {
            background-color: #f0f0f0;
          }
          .beneficiary-section {
            margin-top: 20px;
          }
          .signature-section {
            margin-top: 40px;
            text-align: center;
          }
          .signature-section hr {
            border-top: 2px solid #000;
          }
          .boleta-footer {
            text-align: center;
            font-style: italic;
            color: #666;
            margin-top: 20px;
          }
          .btn-close,
          .modal-buttons {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="boleta-container">
          ${contenido}
        </div>
      </body>
    </html>
  `);

  ventana.document.close();
  ventana.focus(); // Para compatibilidad en algunos navegadores
  ventana.print();
  ventana.onafterprint = () => ventana.close(); // Cierra después de imprimir (opcional)
}

  generarPDF() {
    const doc = new jsPDF();
    const elemento = document.querySelector('.boleta') as HTMLElement;

    if (elemento) {
      const contenido = elemento.innerText;
      doc.text(contenido, 10, 10);
      doc.save('boleta-reserva.pdf');
    }
  }
  /**/

  /*enviar boleta al whatsapp*/
  enviarPorWhatsApp() {
    if (!this.boletaReserva || !this.boletaReserva.telefonoCliente) {
      alert('El cliente no tiene un número de teléfono registrado.');
      return;
    }

    const numeroTelefono = this.boletaReserva.telefonoCliente.replace(/\D/g, '');

    const mensaje = `
Hola, aquí tienes los detalles de tu reserva:

*Cliente:* ${this.boletaReserva.idCliente}
*Fecha:* ${this.boletaReserva.fecha}
*Horario:* ${this.boletaReserva.horario}
*Actividad:* ${this.boletaReserva.actividad}
*Precio:* S/. ${this.boletaReserva.precio}

Puedes depositar en una de las siguientes cuentas
*************************************************
*Banco: BCP (Banco de Crédito del Perú)*
Tipo de cuenta: Ahorros en Soles
Número de cuenta: 193-9284725-1
CCI (Código de Cuenta Interbancario): 00219300092847251682
Titular: Juan Pérez

*Banco: BBVA Perú*
Tipo de cuenta: Cuenta Corriente en Soles
Número de cuenta: 0011-0123456789
CCI: 0110011012345678901
Titular: María López

*Banco: Banco de la Nación*
Tipo de cuenta: Cuenta Institucional en Soles
Número de cuenta: 0002-12345678
CCI: 0210000012345678901
Titular: Empresa S.A.C.

Gracias por confiar en ButiGym
  `;

    const url = `https://api.whatsapp.com/send?phone= ${numeroTelefono}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

}
