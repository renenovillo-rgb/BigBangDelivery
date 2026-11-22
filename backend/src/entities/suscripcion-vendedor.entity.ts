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

export type EstadoSuscripcion = 'activa' | 'vencida' | 'cancelada';

@Entity('suscripciones_vendedores')
export class SuscripcionVendedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tienda_id' })
  tiendaId: string;

  @ManyToOne(() => Tienda, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tienda_id' })
  tienda: Tienda;

  @Column({ name: 'plan_id' })
  planId: string;

  @Column({ name: 'fecha_inicio', type: 'timestamp' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamp' })
  fechaFin: Date;

  @Column({
    type: 'enum',
    enum: ['activa', 'vencida', 'cancelada'],
    default: 'activa',
  })
  estado: EstadoSuscripcion;
}
