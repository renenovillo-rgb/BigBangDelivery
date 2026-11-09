import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type RolUsuario = 'comprador' | 'vendedor' | 'administrador';
export type EstadoUsuario = 'activo' | 'inactivo' | 'pendiente' | 'suspendido';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_cedula', unique: true })
  numeroCedula: string;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ unique: true })
  email: string;

  @Column()
  telefono: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['comprador', 'vendedor', 'administrador'],
    default: 'comprador',
  })
  rol: RolUsuario;

  @Column({
    type: 'enum',
    enum: ['activo', 'inactivo', 'pendiente', 'suspendido'],
    default: 'activo',
  })
  estado: EstadoUsuario;

  @Column({ name: 'direccion_principal', nullable: true })
  direccionPrincipal?: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', nullable: true })
  fechaActualizacion?: Date;
}
