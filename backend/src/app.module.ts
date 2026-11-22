import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AdminPanelModule } from './modules/admin-panel/admin-panel.module';
import { User } from './modules/users/entities/user.entity';
import { Tienda } from './entities/tienda.entity';
import { HistoriaProducto } from './entities/historia-producto.entity';
import { Categoria } from './entities/categoria.entity';
import { SuscripcionVendedor } from './entities/suscripcion-vendedor.entity';
import { Pedido } from './entities/pedido.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'big_ban_user',
      password: process.env.DB_PASSWORD || 'big_ban_secure_password_2026',
      database: process.env.DB_NAME || 'big_ban_community_db',
      entities: [User, Tienda, HistoriaProducto, Categoria, SuscripcionVendedor, Pedido],
      synchronize: true, 
    }),
    AuthModule,
    AdminPanelModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
