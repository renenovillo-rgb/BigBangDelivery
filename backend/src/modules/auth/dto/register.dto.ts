import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export type RolUsuario = 'comprador' | 'vendedor' | 'administrador';

export class RegisterDto { 
    @IsString() 
    @IsNotEmpty({ message: 'El número de cédula o RUC es obligatorio' }) 
    numeroCedula: string; 
    
    @IsString() 
    @IsNotEmpty({ message: 'Los nombres son obligatorios' }) 
    nombres: string; 
    
    @IsString() 
    @IsNotEmpty({ message: 'Los apellidos son obligatorios' }) 
    apellidos: string; 
    
    @IsEmail({}, { message: 'El correo electrónico debe ser válido' }) 
    @IsNotEmpty({ message: 'El correo electrónico es obligatorio' }) 
    email: string; 
    
    @IsString() 
    @IsNotEmpty({ message: 'El teléfono es obligatorio' }) 
    telefono: string; @IsString() 
    
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' }) 
    password: string; 
    
    @IsEnum(['comprador', 'vendedor'], { message: 'El rol debe ser válido' })
    rol: 'comprador' | 'vendedor'; 
    
    @IsOptional() 
    @IsString() 
    direccionPrincipal?: string; }
