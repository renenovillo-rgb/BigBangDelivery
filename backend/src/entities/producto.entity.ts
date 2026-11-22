import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tienda } from './tienda.entity';
import { Categoria } from './categoria.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tiendaId: string;

  @ManyToOne(() => Tienda)
  tienda: Tienda;

  @Column()
  categoriaId: string;

  @ManyToOne(() => Categoria)
  categoria: Categoria;

  @Column()
  nombre: string;

  @Column('text')
  descripcion: string;

  @Column('decimal')
  precio: number;

  @Column()
  imagenUrl: string;

  @Column()
  tipo: string;

  @Column()
  estado: string;

  @Column({ nullable: true })
  unidadMedida: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
