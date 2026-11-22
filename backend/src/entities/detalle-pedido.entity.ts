import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Pedido } from './pedido.entity';

@Entity('detalle_pedidos')
export class DetallePedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pedidoId: string;

  @ManyToOne(() => Pedido, (pedido) => pedido)
  pedido: Pedido;

  @Column()
  productoId: string;

  @Column()
  nombreProducto: string;

  @Column('int')
  cantidad: number;

  @Column('decimal')
  precioUnitario: number;

  @Column('decimal')
  subtotal: number;
}