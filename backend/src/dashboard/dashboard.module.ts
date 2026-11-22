import { Module } from '@nestjs/common';
import { RelatoriosModule } from '../relatorios/relatorios.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [RelatoriosModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
