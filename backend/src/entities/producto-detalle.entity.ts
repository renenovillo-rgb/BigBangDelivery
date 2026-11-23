import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Producto } from './producto.entity';

@Entity('producto_detalles')
export class ProductoDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productoId: string;

  @OneToOne(() => Producto)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  garantia: string;

  @Column({ nullable: true })
  dimensiones: string;

  @Column({ nullable: true })
  peso: string;

  @Column('jsonb', { nullable: true })
  caracteristicasAdicionales: Record<string, string>;

  @Column('text', { nullable: true })
  especificacionesTecnicas: string;
}
