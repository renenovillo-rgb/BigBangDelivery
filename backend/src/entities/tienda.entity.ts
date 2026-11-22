import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../modules/users/entities/user.entity';

export type EstadoTienda = 'pendiente' | 'aprobado' | 'suspendido';

@Entity('tiendas')
export class Tienda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vendedor_id' })
  vendedorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: User;

  @Column({ name: 'nombre_comercial' })
  nombreComercial: string;

  @Column()
  ruc: string;

  @Column({ name: 'categoria_principal' })
  categoriaPrincipal: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column()
  direccion: string;

  @Column()
  telefono: string;

  @Column({ name: 'email_comercial' })
  emailComercial: string;

  @Column({ name: 'logotipo_url', nullable: true })
  logotipoUrl?: string;

  @Column({ name: 'horario_atencion', nullable: true })
  horarioAtencion?: string;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'aprobado', 'suspendido'],
    default: 'pendiente',
  })
  estado: EstadoTienda;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;
}
