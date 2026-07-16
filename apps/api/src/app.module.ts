import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { MediaModule } from './media/media.module';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './admins/admins.module';
import { AuditModule } from './audit/audit.module';
import { CarouselModule } from './carousel/carousel.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    AuditModule,
    AdminsModule,
    CategoriesModule,
    ProductsModule,
    CarouselModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
