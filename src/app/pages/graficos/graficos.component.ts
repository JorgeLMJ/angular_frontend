import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservasService } from '../services/reservas.service';
import { ClientesService } from '../services/clientes.service';
import { Reservas } from '../models/reservas';
import { Clientes } from '../models/clientes';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.css']
})
export class GraficosComponent implements AfterViewInit {
  // Datos para ingresos
  reservas: Reservas[] = [];
  ingresosChart: any;
  ingresoTotal: number = 0;

  // Datos para clientes
  clientes: Clientes[] = [];
  clientesChart: any;
  totalClientes: number = 0;

  constructor(
    private reservasService: ReservasService,
    private clientesService: ClientesService
  ) {}

  ngAfterViewInit(): void {
    this.obtenerReservas();
    this.obtenerClientes();
  }

  // --- Gráfico de Ingresos ---

  obtenerReservas() {
    this.reservasService.getReservas().subscribe({
      next: (data) => {
        this.reservas = data;
        this.generarGraficoIngresosConDatos(this.reservas);
      },
      error: (err) => {
        console.error('Error al obtener reservas:', err);
      }
    });
  }

  generarGraficoIngresosConDatos(reservas: Reservas[]): void {
    if (this.ingresosChart) {
      this.ingresosChart.destroy();
    }

    const datosPorFecha: { [key: string]: number } = {};

    reservas.forEach(reserva => {
      const fecha = reserva.fecha;
      const precio = parseFloat(reserva.precio);

      if (!isNaN(precio) && fecha) {
        datosPorFecha[fecha] = (datosPorFecha[fecha] || 0) + precio;
      }
    });

    const fechasOrdenadas = Object.keys(datosPorFecha).sort();
    const ingresos = fechasOrdenadas.map(fecha => datosPorFecha[fecha]);

    this.ingresoTotal = ingresos.reduce((total, valor) => total + valor, 0);

    const ctx = document.getElementById('ingresosChart') as HTMLCanvasElement | null;
    if (!ctx) return;

    this.ingresosChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechasOrdenadas,
        datasets: [{
          label: 'Ingresos por día (S/.)',
          data: ingresos,
          backgroundColor: 'rgba(75, 192, 192, 0.4)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Ingresos Diarios'
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Fecha' }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Ingresos (S/.)' }
          }
        }
      }
    });
  }

  onFiltroFecha(): void {
    const fechaInicio = (document.getElementById('fechaInicio') as HTMLInputElement).value;
    const fechaFin = (document.getElementById('fechaFin') as HTMLInputElement).value;

    let reservasFiltradas = [...this.reservas];

    if (fechaInicio) {
      reservasFiltradas = reservasFiltradas.filter(reserva =>
        reserva.fecha >= fechaInicio
      );
    }

    if (fechaFin) {
      reservasFiltradas = reservasFiltradas.filter(reserva =>
        reserva.fecha <= fechaFin
      );
    }

    this.generarGraficoIngresosConDatos(reservasFiltradas);
  }

  restablecerFiltro(): void {
    (document.getElementById('fechaInicio') as HTMLInputElement).value = '';
    (document.getElementById('fechaFin') as HTMLInputElement).value = '';
    this.generarGraficoIngresosConDatos(this.reservas);
  }

  // --- Gráfico de Estados de Clientes ---

  obtenerClientes() {
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.generarGraficoClientesPorEstado(this.clientes);
      },
      error: (err) => {
        console.error('Error al obtener clientes:', err);
      }
    });
  }

  generarGraficoClientesPorEstado(clientes: Clientes[]): void {
    if (this.clientesChart) {
      this.clientesChart.destroy(); // Destruir gráfico anterior si existe
    }

    const estados = ['pendiente', 'atendido', 'esperando', 'ignorado'];
    const datos: number[] = Array(4).fill(0); // Inicializar en cero

    clientes.forEach(cliente => {
      const index = estados.indexOf(cliente.estado.toLowerCase());
      if (index !== -1) {
        datos[index]++;
      }
    });

    this.totalClientes = datos.reduce((a, b) => a + b, 0);

    const ctx = document.getElementById('clientesEstadoChart') as HTMLCanvasElement | null;
    if (!ctx) return;

    this.clientesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Pendiente', 'Atendido', 'Esperando', 'Ignorado'],
        datasets: [{
          label: 'Número de Clientes',
          data: datos,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(150, 150, 150, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(150, 150, 150, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Clientes por Estado'
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Estado' }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Cantidad' },
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }
}