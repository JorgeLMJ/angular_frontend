import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservasService } from '../services/reservas.service';
import { ClientesService } from '../services/clientes.service';
import { InstructoresService } from '../services/instructores.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';//para dar siseño a las alertas
import { Clientes } from '../models/clientes';
import { Instructores } from '../models/instructores';
import { PaymentService } from '../services/payment.service'; 
import { loadStripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-reservas-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './reservas-form.component.html',
  styleUrls: ['./reservas-form.component.css'],
})

export class ReservasFormComponent {
  formReservas!: FormGroup;
  isSaveInProgress: boolean = false;
  edit: boolean = false;
  reservaId!: number;
  isClienteModalOpen: boolean = false;
  isInstructorModalOpen: boolean = false;

  // Propiedades para manejar la ventana modal y los clientes
  clientes: Clientes[] = [];
  instructores: Instructores[] = [];
  filteredClientes: Clientes[] = [];
  filteredInstructores: Instructores[] = [];
  searchTerm: string = '';
  isModalOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private clientesService: ClientesService,
    private instructoresService: InstructoresService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
      ) {
    this.formReservas = this.fb.group({
      idCliente: ['', Validators.required],
      idInstructor: ['', Validators.required],
      horario: ['', Validators.required],
      fecha: ['', Validators.required],
      precio: ['', Validators.required],
      actividad: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== 'new') {
      this.edit = true;
      this.getReservasById(+id!);
    }

    // Cargar los clientes desde el backend
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filteredClientes = [...this.clientes];
      },
      error: (err) => {
        console.error('Error al obtener los clientes', err);
      }
    });

    // Cargar los clientes desde el backend
    this.instructoresService.getInstructores().subscribe({
      next: (data) => {
        this.instructores = data;
        this.filteredInstructores = [...this.instructores];
      },
      error: (err) => {
        console.error('Error al obtener los instructores', err);
      }
    });

  }
  getReservasById(id: number) {
    this.reservasService.getReservaById(id).subscribe({
      next: (foundReserva) => {
        this.formReservas.patchValue(foundReserva);
      },
      error: (err) => {
        alert('Error al cargar la reserva: ' + (err.error?.message || 'No encontrado'));
        this.router.navigateByUrl('/');
      }
    });
  }


  createReservas() {
    if (this.formReservas.valid) {
      const formData = this.formReservas.value;
      this.reservasService.createReserva(formData).subscribe({
        next: (response) => {
          this.router.navigate(['/reservas']);
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Reserva creada exitosamente.',
            showConfirmButton: false,
            timer: 2000
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Error al guardar la reserva.'
          });
        }
      });
    } else {
      this.formReservas.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Complete todos los campos requeridos.'
      });
    }
  }

  updateReservas() {
    if (this.formReservas.valid) {
      const formData = this.formReservas.value;
      this.reservasService.updateReserva(formData).subscribe({
        next: () => {
          // Opcional: descomenta si usas makePayment()
          // this.makePayment();
  
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Reserva actualizada correctamente.',
            showConfirmButton: false,
            timer: 2000
          });
  
          // Navegar después de mostrar la alerta (opcional)
          setTimeout(() => {
            this.router.navigate(['/reservas']);
          }, 1500);
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Hubo un problema al actualizar la reserva.'
          });
        }
      });
    } else {
      this.formReservas.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor complete todos los campos requeridos.'
      });
    }
  }


  openModalClientes(): void {
    this.isClienteModalOpen  = true; // Abre la ventana modal
    this.searchTerm = ''; // Limpia el término de búsqueda
    this.filteredClientes = [...this.clientes]; // Restablece la lista filtrada
  }
  openModalInstructores(): void {
    this.isInstructorModalOpen  = true; // Abre la ventana modal
    this.searchTerm = ''; // Limpia el término de búsqueda
    this.filteredInstructores = [...this.instructores]; // Restablece la lista filtrada
  }
  
  closeModalClientes(): void {
    this.isClienteModalOpen  = false; // Cierra la ventana modal
  }
  
  closeModalInstructores(): void {
    this.isInstructorModalOpen  = false; // Cierra la ventana modal
  }
  selectCliente(cliente: Clientes): void {
    // Asigna el ID del cliente seleccionado al campo idCliente del formulario
    this.formReservas.get('idCliente')?.setValue(cliente.id);
    this.closeModalClientes(); // Cierra la ventana modal después de seleccionar un cliente
  }

  selectInstructores(instructores: Instructores): void {
    this.formReservas.get('idInstructor')?.setValue(instructores.id);
    this.closeModalInstructores();
  }

  filterClients(): void {
    // Filtra los clientes según el término de búsqueda
    this.filteredClientes = this.clientes.filter(cliente =>
      cliente.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      cliente.surname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  filterInstructores(): void {
    this.filteredInstructores = this.instructores.filter(instructores =>
      instructores.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      instructores.surname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      instructores.especialidad.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

 
}