import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstructoresService } from '../services/instructores.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';//para dar siseño a las alertas
import Swal from 'sweetalert2';

@Component({
  selector: 'app-instructores-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './instructores-form.component.html',
  styleUrl: './instructores-form.component.css'
})
export class InstructoresFormComponent {
  formInstructores!: FormGroup;
  isSaveInProgress: boolean = false;
  edit: boolean = false;
  instructorId!: number;

  constructor(
    private fb: FormBuilder,
    private instructoresService: InstructoresService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.formInstructores = this.fb.group({
      
      id: [null],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      dni: ['', Validators.required],
      sex: ['', Validators.required],
      email: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      especialidad: ['', Validators.required],
      fechaContratacion: ['', Validators.required],
      tipoContrato: ['', Validators.required],
      salario: ['', Validators.required],
      disponibilidad: ['', Validators.required],
      estado: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== 'new') {
      this.edit = true;
      this.getInstructoresById(+id!);
    } 
    this.setupFieldValidations();
  }
  setupFieldValidations(): void {
    // Validar en tiempo real cada campo único
    this.formInstructores.get('email')?.valueChanges.subscribe(email => {
      if (email && !this.formInstructores.get('email')?.errors?.['required']) {
        this.checkFieldUniqueness('email', email);
      }
    });

    this.formInstructores.get('phoneNumber')?.valueChanges.subscribe(phone => {
      if (phone && !this.formInstructores.get('phoneNumber')?.errors?.['required']) {
        this.checkFieldUniqueness('phoneNumber', phone);
      }
    });

    this.formInstructores.get('dni')?.valueChanges.subscribe(dni => {
      if (dni && !this.formInstructores.get('dni')?.errors?.['required']) {
        this.checkFieldUniqueness('dni', dni);
      }
    });
  }
  getInstructoresById(id: number) {
    this.instructoresService.getInstructorById(id).subscribe({
      next: (foundInstructor) => {
        this.formInstructores.patchValue(foundInstructor);
      },
      error: (err) => {
        alert('Error al cargar el cliente: ' + (err.error?.message || 'No encontrado'));
        this.router.navigateByUrl('/');
      }
    });
  }

  createInstructores() {
    if (this.formInstructores.valid) {
      const formData = this.formInstructores.value;
      this.instructoresService.createInstructor(formData).subscribe({
        next: (response) => {
          this.router.navigate(['/instructores']);
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Instructor creado exitosamente.',
            showConfirmButton: false,
            timer: 2000
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Error al guardar el Instructor.'
          });
        }
      });
    } else {
      this.formInstructores.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Complete todos los campos requeridos.'
      });
    }
  }
  updateInstructores() {
    if (this.formInstructores.valid) {
      const formData = this.formInstructores.value;
      this.instructoresService.updateInstructor(formData).subscribe({
        next: (response) => {
          console.log("Instructor actualizado:", response);
          this.router.navigate(['/instructores']);
  
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Instructor actualizado correctamente.',
            showConfirmButton: false,
            timer: 2000
          });
        },
        error: (err) => {
          console.error("Error al actualizar:", err);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Hubo un problema al actualizar el instructor.'
          });
        }
      });
    } else {
      this.formInstructores.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor complete todos los campos requeridos.'
      });
    }
  }
  checkFieldUniqueness(field: string, value: any): void {
    this.instructoresService.checkFieldExists(field, value).subscribe(
      exists => {
        if (exists) {
          this.formInstructores.get(field)?.setErrors({ duplicate: true });
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