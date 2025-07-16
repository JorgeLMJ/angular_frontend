export interface Reservas{  
    id:number;
    horario:string;
    fecha:string;
    precio:string;
    actividad:string;
    idInstructor:string;
    idCliente:string;
    telefonoCliente?: string;  // nuevo campo opcional
}