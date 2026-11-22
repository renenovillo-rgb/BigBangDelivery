import { Module } from '@nestjs/common';
import { AdminPanelController } from './admin-panel.controller';
import { AdminPanelService } from './admin-panel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tienda } from '../../entities/tienda.entity';
import { HistoriaProducto } from '../../entities/historia-producto.entity';
import { Categoria } from '../../entities/categoria.entity';
import { Pedido } from '../../entities/pedido.entity';
import { SuscripcionVendedor } from '../../entities/suscripcion-vendedor.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tienda,
      HistoriaProducto,
      Categoria,
      Pedido,
      SuscripcionVendedor,
      User,
    ]),
  ],
  controllers: [AdminPanelController],
  providers: [AdminPanelService],
})
export class AdminPanelModule {}
