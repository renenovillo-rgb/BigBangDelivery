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
import { User } from '../modules/users/entities/user.entity';

export type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'EN_PREPARACION' | 'LISTO' | 'COMPLETADO' | 'CANCELADO';
export type EstadoPago = 'pendiente' | 'pagado' | 'rechazado' | 'reembolsado';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_pedido', unique: true })
  numeroPedido: string;

  @Column({ name: 'tienda_id' })
  tiendaId: string;

  @ManyToOne(() => Tienda, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tienda_id' })
  tienda: Tienda;

  @Column({ name: 'comprador_id' })
  compradorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comprador_id' })
  comprador: User;

  @Column({ name: 'nombre_cliente' })
  nombreCliente: string;

  @Column({ name: 'identificacion_cliente' })
  identificacionCliente: string;

  @Column({ name: 'email_cliente' })
  emailCliente: string;

  @Column({ name: 'telefono_cliente' })
  telefonoCliente: string;

  @Column({ name: 'direccion_entrega' })
  direccionEntrega: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'monto_iva', type: 'decimal', precision: 10, scale: 2 })
  montoIva: number;

  @Column({ name: 'costo_envio', type: 'decimal', precision: 10, scale: 2 })
  costoEnvio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  descuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'medio_pago' })
  medioPago: string;

  @Column({
    type: 'enum',
    enum: ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'COMPLETADO', 'CANCELADO'],
    default: 'PENDIENTE',
  })
  estadoPedido: EstadoPedido;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'pagado', 'rechazado', 'reembolsado'],
    default: 'pendiente',
  })
  estadoPago: EstadoPago;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', nullable: true })
  fechaActualizacion?: Date;
}
