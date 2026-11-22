import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tienda, EstadoTienda } from '../../entities/tienda.entity';
import { HistoriaProducto, EstadoHistoria } from '../../entities/historia-producto.entity';
import { Categoria } from '../../entities/categoria.entity';
import { Pedido } from '../../entities/pedido.entity';
import { SuscripcionVendedor } from '../../entities/suscripcion-vendedor.entity';
import { User, EstadoUsuario } from '../users/entities/user.entity';

@Injectable()
export class AdminPanelService {
  constructor(
    @InjectRepository(Tienda) private tiendaRepo: Repository<Tienda>,
    @InjectRepository(HistoriaProducto) private historiaRepo: Repository<HistoriaProducto>,
    @InjectRepository(Categoria) private categoriaRepo: Repository<Categoria>,
    @InjectRepository(Pedido) private pedidoRepo: Repository<Pedido>,
    @InjectRepository(SuscripcionVendedor) private suscripcionRepo: Repository<SuscripcionVendedor>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getDashboardStats() {
    const [totalUsuarios, tiendasPendientes, historiasPendientes, totalPedidos] = await Promise.all([
      this.userRepo.count(),
      this.tiendaRepo.count({ where: { estado: 'pendiente' } }),
      this.historiaRepo.count({ where: { estado: 'EN_REVISION' } }),
      this.pedidoRepo.count(),
    ]);
    return { totalUsuarios, tiendasPendientes, historiasPendientes, totalPedidos };
  }

  // Tiendas
  async getTiendas() {
    return this.tiendaRepo.find({ relations: { vendedor: true } });
  }

  async updateEstadoTienda(id: string, estado: EstadoTienda) {
    await this.tiendaRepo.update(id, { estado });
    return this.tiendaRepo.findOne({ where: { id }, relations: { vendedor: true } });
  }

  // Historias / Moderación
  async getHistorias() {
    return this.historiaRepo.find();
  }

  async moderarHistoria(id: string, estado: EstadoHistoria, observacionesAdmin?: string) {
    await this.historiaRepo.update(id, { estado, observacionesAdmin });
    return this.historiaRepo.findOne({ where: { id } });
  }

  // Categorías
  async getCategorias() {
    return this.categoriaRepo.find();
  }

  async crearCategoria(data: Partial<Categoria>) {
    const cat = this.categoriaRepo.create(data);
    return this.categoriaRepo.save(cat);
  }

  async updateCategoria(id: string, data: Partial<Categoria>) {
    await this.categoriaRepo.update(id, data);
    return this.categoriaRepo.findOne({ where: { id } });
  }

  // Usuarios
  async getUsuarios() {
    return this.userRepo.find();
  }

  async updateEstadoUsuario(id: string, estado: EstadoUsuario) {
    await this.userRepo.update(id, { estado });
    return this.userRepo.findOne({ where: { id } });
  }

  // Pedidos
  async getPedidos() {
    return this.pedidoRepo.find({ relations: { tienda: true, comprador: true } });
  }

  // Suscripciones
  async getSuscripciones() {
    return this.suscripcionRepo.find({ relations: { tienda: true } });
  }
}
