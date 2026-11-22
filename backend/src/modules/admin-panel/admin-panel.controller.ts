import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminPanelService } from './admin-panel.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateEstadoTiendaDto } from './dto/update-estado-tienda.dto';
import { ModerarHistoriaDto } from './dto/moderar-historia.dto';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/categoria.dto';
import { UpdateEstadoUsuarioDto } from './dto/update-estado-usuario.dto';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
export class AdminPanelController {
  constructor(private readonly adminService: AdminPanelService) {}

  @Get('dashboard-stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('stores')
  getTiendas() {
    return this.adminService.getTiendas();
  }

  @Patch('stores/:id/status')
  updateEstadoTienda(@Param('id') id: string, @Body() dto: UpdateEstadoTiendaDto) {
    return this.adminService.updateEstadoTienda(id, dto.estado);
  }

  @Get('stories')
  getHistorias() {
    return this.adminService.getHistorias();
  }

  @Patch('stories/:id/moderate')
  moderarHistoria(@Param('id') id: string, @Body() dto: ModerarHistoriaDto) {
    return this.adminService.moderarHistoria(id, dto.estado, dto.observacionesAdmin);
  }

  @Get('categories')
  getCategorias() {
    return this.adminService.getCategorias();
  }

  @Post('categories')
  crearCategoria(@Body() dto: CreateCategoriaDto) {
    return this.adminService.crearCategoria(dto);
  }

  @Patch('categories/:id')
  updateCategoria(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    return this.adminService.updateCategoria(id, dto);
  }

  @Get('users')
  getUsuarios() {
    return this.adminService.getUsuarios();
  }

  @Patch('users/:id/status')
  updateEstadoUsuario(@Param('id') id: string, @Body() dto: UpdateEstadoUsuarioDto) {
    return this.adminService.updateEstadoUsuario(id, dto.estado);
  }

  @Get('orders')
  getPedidos() {
    return this.adminService.getPedidos();
  }

  @Get('subscriptions')
  getSuscripciones() {
    return this.adminService.getSuscripciones();
  }
}
