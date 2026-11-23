import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AdminPanelModule } from './modules/admin-panel/admin-panel.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    AdminPanelModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
