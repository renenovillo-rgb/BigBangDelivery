import { IsEnum, IsNotEmpty } from 'class-validator';
import type { EstadoUsuario } from '../../users/entities/user.entity';

export class UpdateEstadoUsuarioDto {
  @IsNotEmpty()
  @IsEnum(['activo', 'inactivo', 'pendiente', 'suspendido'])
  estado: EstadoUsuario;
}
