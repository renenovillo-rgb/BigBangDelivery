import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tienda } from './tienda.entity';

export type EstadoHistoria = 'EN_REVISION' | 'PUBLICADA' | 'RECHAZADA';

@Entity('historias_productos')
export class HistoriaProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'codigo_historia', unique: true })
  codigoHistoria: string;

  @Column({ name: 'producto_id' })
  productoId: string;

  @Column({ name: 'nombre_producto' })
  nombreProducto: string;

  @Column({ name: 'vendedor_id' })
  vendedorId: string;

  @Column({ name: 'historia_propuesta', type: 'text' })
  historiaPropuesta: string;

  @Column({ name: 'media_url', nullable: true })
  mediaUrl?: string;

  @Column({
    type: 'enum',
    enum: ['EN_REVISION', 'PUBLICADA', 'RECHAZADA'],
    default: 'EN_REVISION',
  })
  estado: EstadoHistoria;

  @Column({ name: 'observaciones_admin', type: 'text', nullable: true })
  observacionesAdmin?: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', nullable: true })
  fechaActualizacion?: Date;
}
