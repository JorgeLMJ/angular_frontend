import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService } from '../services/clientes.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './clientes-form.component.html',
  styleUrls: ['./clientes-form.component.css']
})
export class ClientesFormComponent {

  formClientes!: FormGroup;
  isSaveInProgress: boolean = false;
  edit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClientesService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.formClientes = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      message: ['', Validators.required],
      fechaRegistro: ['', Validators.required],
      estado: ['', Validators.required],
      dni: [''],
    });
  }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== 'new') {
      this.edit = true;
      this.getClientesById(+id!);
    } else {
      // Establecer fecha actual solo al crear un nuevo cliente
      const now = new Date();
      const formattedDate = formatDate(now, 'yyyy-MM-dd HH:mm:ss', 'en-US');
      this.formClientes.patchValue({ fechaRegistro: formattedDate });
    }

    this.setupFieldValidations();
  }

  setupFieldValidations(): void {
    // Validar en tiempo real cada campo único
    this.formClientes.get('email')?.valueChanges.subscribe(email => {
      if (email && !this.formClientes.get('email')?.errors?.['required']) {
        this.checkFieldUniqueness('email', email);
      }
    });

    this.formClientes.get('phoneNumber')?.valueChanges.subscribe(phone => {
      if (phone && !this.formClientes.get('phoneNumber')?.errors?.['required']) {
        this.checkFieldUniqueness('phoneNumber', phone);
      }
    });

    this.formClientes.get('dni')?.valueChanges.subscribe(dni => {
      if (dni && !this.formClientes.get('dni')?.errors?.['required']) {
        this.checkFieldUniqueness('dni', dni);
      }
    });
  }

  getClientesById(id: number) {
    this.clienteService.getClienteById(id).subscribe({
      next: (foundCliente) => {
        this.formClientes.patchValue(foundCliente);
      },
      error: (err) => {
        alert('Error al cargar el cliente: ' + (err.error?.message || 'No encontrado'));
        this.router.navigateByUrl('/');
      }
    });
  }

  createClientes() {
    if (this.formClientes.valid) {
      const formData = this.formClientes.value;
      this.isSaveInProgress = true;

      this.clienteService.createCliente(formData).subscribe({
        next: (response) => {
          this.isSaveInProgress = false;
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Cliente creado exitosamente.',
            showConfirmButton: false,
            timer: 2000
          }).then(() => {
            this.router.navigate(['/clientes']);
          });
        },
        error: (err) => {
          this.isSaveInProgress = false;
          let errorMessage = 'Error al guardar el cliente.';
          if (err.status === 409 && err.error) {
            errorMessage = err.error;
          }

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: errorMessage
          });
        }
      });
    } else {
      this.formClientes.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Complete todos los campos requeridos.'
      });
    }
  }

  updateClientes() {
    if (this.formClientes.valid) {
      const formData = this.formClientes.value;
      this.isSaveInProgress = true;

      this.clienteService.updateCliente(formData).subscribe({
        next: (response) => {
          this.isSaveInProgress = false;
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Cliente actualizado correctamente.',
            showConfirmButton: false,
            timer: 2000
          }).then(() => {
            this.router.navigate(['/clientes']);
          });
        },
        error: (err) => {
          this.isSaveInProgress = false;
          let errorMessage = 'Hubo un problema al actualizar el cliente.';
          if (err.status === 409 && err.error) {
            errorMessage = err.error;
          }

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: errorMessage
          });
        }
      });
    } else {
      this.formClientes.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor complete todos los campos requeridos.'
      });
    }
  }

  checkFieldUniqueness(field: string, value: any): void {
    this.clienteService.checkFieldExists(field, value).subscribe(
      exists => {
        if (exists) {
          this.formClientes.get(field)?.setErrors({ duplicate: true });
          Swal.fire({
            icon: 'error',
            title: 'Duplicado',
            text: `${this.getFieldLabel(field)} ya está registrado.`,
            timer: 2500,
            showConfirmButton: false
          });
        }
      },
      error => {
        console.error(`Error verificando ${field}:`, error);
      }
    );
  }

  getFieldLabel(field: string): string {
    switch (field) {
      case 'email': return 'Correo electrónico';
      case 'phoneNumber': return 'Teléfono';
      case 'dni': return 'DNI';
      default: return field;
    }
  }
}