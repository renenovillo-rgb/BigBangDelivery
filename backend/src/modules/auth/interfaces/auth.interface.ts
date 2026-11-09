export interface Usuario {
  id: string;
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: 'comprador' | 'vendedor' | 'administrador';
  estado: string;
  direccionPrincipal?: string;
  fechaCreacion: string;
}

export interface RespuestaAutenticacion {
  tokenAcceso: string;
  usuario: Usuario;
}
