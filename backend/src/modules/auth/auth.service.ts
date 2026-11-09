import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { RespuestaAutenticacion } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: RegisterDto): Promise<RespuestaAutenticacion> {
    const existe = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existe) {
      throw new ConflictException(
        'El correo electrónico ya se encuentra registrado',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const nuevoUsuario = this.userRepository.create({
      numeroCedula: dto.numeroCedula,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      email: dto.email,
      telefono: dto.telefono,
      password: passwordHash,
      rol: dto.rol,
      estado: 'activo',
      direccionPrincipal: dto.direccionPrincipal || '',
    });

    await this.userRepository.save(nuevoUsuario);

    const payload = {
      sub: nuevoUsuario.id,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
    };
    const tokenAcceso = this.jwtService.sign(payload);

    return {
      tokenAcceso,
      usuario: {
        id: nuevoUsuario.id,
        numeroCedula: nuevoUsuario.numeroCedula,
        nombres: nuevoUsuario.nombres,
        apellidos: nuevoUsuario.apellidos,
        email: nuevoUsuario.email,
        telefono: nuevoUsuario.telefono,
        rol: nuevoUsuario.rol,
        estado: nuevoUsuario.estado,
        direccionPrincipal: nuevoUsuario.direccionPrincipal,
        fechaCreacion: nuevoUsuario.fechaCreacion.toISOString(),
      },
    };
  }

  async login(dto: LoginDto): Promise<RespuestaAutenticacion> {
    const usuario = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales de acceso incorrectas');
    }

    const esPasswordValida = await bcrypt.compare(
      dto.password,
      usuario.password,
    );
    if (!esPasswordValida) {
      throw new UnauthorizedException('Credenciales de acceso incorrectas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };
    const tokenAcceso = this.jwtService.sign(payload);

    return {
      tokenAcceso,
      usuario: {
        id: usuario.id,
        numeroCedula: usuario.numeroCedula,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        estado: usuario.estado,
        direccionPrincipal: usuario.direccionPrincipal,
        fechaCreacion: usuario.fechaCreacion.toISOString(),
      },
    };
  }
}
