import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  prestadorId: string;

  @Column()
  categoriaId: string;

  @Column()
  nombre: string;

  @Column('text')
  descripcion: string;

  @Column('decimal')
  precioReferencial: number;

  @Column()
  modalidadCotizacion: string;

  @Column()
  zonaAtencion: string;

  @Column({ default: true })
  disponible: boolean;

  @Column()
  estado: string;

  @CreateDateColumn()
  fechaCreacion: Date;
}
