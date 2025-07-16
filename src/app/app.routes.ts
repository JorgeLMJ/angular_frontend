import { Routes } from '@angular/router';
import {ClientesComponent} from './pages/clientes/clientes.component';
import {InstructoresComponent} from './pages/instructores/instructores.component';
import {ReservasComponent} from './pages/reservas/reservas.component';
import {GraficosComponent} from './pages/graficos/graficos.component';
import {AuthComponent} from './components/auth/auth.component';

import { authGuard } from './guards/auth.guard';
import { ClientesFormComponent } from './pages/clientes-form/clientes-form.component';
import { InstructoresFormComponent } from './pages/instructores-form/instructores-form.component';
import { ReservasFormComponent } from './pages/reservas-form/reservas-form.component';

export const routes: Routes = [
    {path: '', redirectTo:'auth',pathMatch:'full'},

    {path: 'clientes', component: ClientesComponent, canActivate:[authGuard]},
    {path: 'instructores', component: InstructoresComponent, canActivate:[authGuard]},
    {path: 'reservas', component: ReservasComponent, canActivate:[authGuard]},
    {path: 'graficos', component: GraficosComponent, canActivate:[authGuard]},

    {path: 'clientes-form/:id', component: ClientesFormComponent, canActivate:[authGuard]},
    {path: 'instructores-form/:id', component: InstructoresFormComponent, canActivate:[authGuard]},
    {path: 'reservas-form/:id', component: ReservasFormComponent, canActivate:[authGuard]},
    {path: 'auth', component: AuthComponent},
    {path: '**', redirectTo:'auth',pathMatch:'full'},
];
