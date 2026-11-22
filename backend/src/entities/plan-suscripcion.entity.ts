import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('planes_suscripcion')
export class PlanSuscripcion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column('decimal')
  precioMensual: number;

  @Column('int')
  duracionDias: number;

  @Column('int')
  limiteProductos: number;

  @Column('decimal')
  comisionPorcentaje: number;

  @Column({ default: true })
  activo: boolean;
}
