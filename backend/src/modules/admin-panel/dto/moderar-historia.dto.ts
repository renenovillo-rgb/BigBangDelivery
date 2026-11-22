import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { EstadoHistoria } from '../../../entities/historia-producto.entity';

export class ModerarHistoriaDto {
  @IsNotEmpty()
  @IsEnum(['EN_REVISION', 'PUBLICADA', 'RECHAZADA'])
  estado: EstadoHistoria;

  @IsOptional()
  @IsString()
  observacionesAdmin?: string;
}
