import { IsEnum, IsNotEmpty } from 'class-validator';
import type { EstadoTienda } from '../../../entities/tienda.entity';

export class UpdateEstadoTiendaDto {
  @IsNotEmpty()
  @IsEnum(['pendiente', 'aprobado', 'suspendido'])
  estado: EstadoTienda;
}
